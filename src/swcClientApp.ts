const Webpack = require("webpack");

const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./../webpack.config.js");

const debug = require("debug")("ndb:swc-client:app");

import {Configuration} from "./configuration";

const compiler = Webpack(webpackConfig);

const server = new WebpackDevServer(compiler, {
    stats: {
        colors: true
    },
    proxy: {
        "/graphql": {
            target: `http://${Configuration.graphQLHostname}:${Configuration.graphQLPort}`
        }
    },
    disableHostCheck: true,
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    historyApiFallback: true,
    noInfo: false,
    quiet: false});

server.listen(Configuration.port, "0.0.0.0", () =>{
    debug(`Starting swc client server on http://localhost:${Configuration.port}`);
});
