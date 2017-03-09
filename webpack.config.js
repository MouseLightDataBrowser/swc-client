const path = require("path");

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
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devtool: 'inline-source-map',
};
