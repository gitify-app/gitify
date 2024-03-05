import type { Configuration } from 'webpack';

import { plugins } from './webpack.plugins';
import { rules } from './webpack.rules';

rules.push({
  test: /\.css$/,
  use: ['style-loader', 'css-loader', 'postcss-loader'],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.css'],
  },
};
