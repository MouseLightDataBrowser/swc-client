const path = require("path");

import {Configuration} from "./src/configuration";

module.exports = {
    entry: [
        `webpack-dev-server/client?http://localhost:${Configuration.port}/`,
        "./src/index"
    ],
    devServer: {
        proxy: {
            "/graphql": {
                target: `http://${Configuration.graphQLHostname}:${Configuration.graphQLPort}`
            }
        }
    },
    output: {
        filename: 'bundle.js',
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
            {test: /\.css$/, use: 'style-loader'},
            {test: /\.css$/, use: 'css-loader'}
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devtool: 'inline-source-map',
};
