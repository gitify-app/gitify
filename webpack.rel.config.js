var webpack = require('webpack');
var config = require('./webpack.config.js');

config.devtool = '';

config.plugins = config.plugins.concat([
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
    output: {
      comments: false,
    }
  }),
  new webpack.NoErrorsPlugin()
]);

module.exports = config;
