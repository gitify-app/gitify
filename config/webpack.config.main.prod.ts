import TerserPlugin from 'terser-webpack-plugin';
import type webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.main.base';

const configuration: webpack.Configuration = {
  devtool: 'source-map',

  mode: 'production',

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};

export default merge(baseConfig, configuration);
