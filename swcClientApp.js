const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config");
const debug = require("debug")("ndb:swc-client:app");
const PORT = 9673;
const compiler = Webpack(webpackConfig);
const server = new WebpackDevServer(compiler, {
    stats: {
        colors: true
    },
    proxy: {
        "/graphql": {
            target: `http://localhost:9671`
        }
    },
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    historyApiFallback: true,
    noInfo: false,
    quiet: false
});
server.listen(PORT, "0.0.0.0", () => {
    debug(`Starting server on http://localhost:${PORT}`);
});
//# sourceMappingURL=swcClientApp.js.map