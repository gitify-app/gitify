import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import type webpack from 'webpack';
import { merge } from 'webpack-merge';

import baseConfig from './webpack.config.renderer.base';

const configuration: webpack.Configuration = {
  devtool: false,

  mode: 'production',

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
};

export default merge(baseConfig, configuration);
