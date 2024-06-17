// @ts-check

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

/**
 * @typedef {import('webpack').Configuration} WebpackConfig
 */

/**
 * @type {WebpackConfig}
 */
const config = merge(common, {
  mode: 'production',
  devtool: 'source-map',
});

module.exports = config;
