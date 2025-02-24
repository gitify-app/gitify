import path from 'node:path';
import type webpack from 'webpack';
import { merge } from 'webpack-merge';

import baseConfig from './webpack.config.common';
import webpackPaths from './webpack.paths';

const configuration: webpack.Configuration = {
  devtool: 'inline-source-map',

  mode: 'development',

  target: 'electron-preload',

  entry: [path.join(webpackPaths.srcMainPath, 'preload.ts')],

  output: {
    path: webpackPaths.buildPath,
    filename: 'preload.js',
    library: {
      type: 'umd',
    },
  },
};

export default merge(baseConfig, configuration);
