import * as path from "path";
import * as os from "os";
import {ServiceOptions} from "./serviceOptions";

const express = require("express");
const proxy = require("express-http-proxy");
const passport = require("passport");
const DigestStrategy = require("passport-http").DigestStrategy;

const debug = require("debug")("ndb:swc-client:app");

passport.use(new DigestStrategy({qop: "auth"},
    function (username: any, done: any) {
        if (username === ServiceOptions.authUser) {
            return done(null, {id: 1, name: username}, ServiceOptions.authPassword);
        } else {
            return done("Invalid user", null);
        }
    },
    function (params: any, done: any) {
        // validate nonce as necessary
        done(null, true)
    }
));

passport.serializeUser(function (user: any, done: any) {
    done(null, user.id);
});

passport.deserializeUser(function (id: any, done: any) {
    done(null, {id: 1, name: ServiceOptions.authUser});
});

const apiUri = `http://${ServiceOptions.graphQLHostname}:${ServiceOptions.graphQLPort}`;
debug(`proxy GraphQL calls to ${apiUri}/${ServiceOptions.graphQLEndpoint}`);

let app = null;

if (process.env.NODE_ENV !== "production") {
    app = devServer();
} else {
    debug("configuring production express server");

    const rootPath = path.resolve(path.join(__dirname, "public"));

    app = express();

    if (ServiceOptions.authRequired) {
        app.use(passport.initialize());

        app.get("/", passport.authenticate("digest", {session: false}), (request: any, response: any, next: any) => {
            next();
        });
    }

    app.post(`/${ServiceOptions.graphQLEndpoint}`, proxy(`${apiUri}/${ServiceOptions.graphQLEndpoint}`, {
        limit: "50mb"
    }));

    app.use(express.static(rootPath));

    app.use("/", (req: any, res: any) => {
        res.sendFile(path.join(rootPath, "index.html"));
    });
}

function devServer() {
    debug("configuring webpack dev server");
    const webpackConfig = require("../webpack.dev.config.js");
    const Webpack = require("webpack");
    const webpackDevServer = require("webpack-dev-server");
    const compiler = Webpack(webpackConfig);

    return new webpackDevServer(compiler, {
        stats: {
            colors: true
        },
        proxy: {
            [`/${ServiceOptions.graphQLEndpoint}`]: {
                target: apiUri
            }
        },
        disableHostCheck: true,
        publicPath: webpackConfig.output.publicPath,
        historyApiFallback: true,
        noInfo: false,
        quiet: false
    });
}

app.listen(ServiceOptions.port, "0.0.0.0", () => {
    if (process.env.NODE_ENV !== "production") {
        debug(`Listening at http://${os.hostname()}:${ServiceOptions.port}/`);
    } else {
        debug(`Listening on port http://localhost:${ServiceOptions.port}`);
    }
});
