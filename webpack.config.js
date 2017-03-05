const webpack = require('webpack');

module.exports = {
    entry: __dirname + '/lib/index.jsx',
    output: {
         path: __dirname + '/build',
         filename: 'efktr-body.js',
         libraryTarget: 'var',
         library: 'EfktrBody'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ["es2015"]
                }
            },
            {
                test: /\.png$/,
                loader: "url-loader",
                query: {
                    mimetype: "image/png"
                }
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
 };