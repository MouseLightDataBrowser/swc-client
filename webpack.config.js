const path = require("path");
/*
module.exports = {
    devtool: "sourcemap",
    entry: [
        `webpack-dev-server/client?http://localhost:9673/`,
        "./src/index"
    ],
    devServer: {
        proxy: {
            "/graphql": {
                target: `http://localhost:9671`
            }
        }
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/static/"
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ["babel"],
                include: path.join(__dirname, "src")
            }, {
                test: /\.tsx?$/, loader: "babel-loader?presets[]=es2015!ts-loader"
            }
        ]
    }
};
*/
module.exports = {
    entry: [
        `webpack-dev-server/client?http://localhost:9673/`,
        "./src/index"
    ],
    devServer: {
        proxy: {
            "/graphql": {
                target: `http://localhost:9671`
            }
        }
    },
    output: {
        filename: '/bundle.js',
        path: '/',
        publicPath: '/static/'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devtool: 'inline-source-map',
};