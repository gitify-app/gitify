import path from 'node:path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.common';
import webpackPaths from './webpack.paths';

import { ALL_EMOJI_SVG_FILENAMES } from '../src/renderer/utils/emojis';

const configuration: webpack.Configuration = {
  devtool: 'inline-source-map',

  mode: 'development',

  target: 'electron-renderer',

  entry: [path.join(webpackPaths.srcRendererPath, 'index.tsx')],

  output: {
    path: webpackPaths.buildPath,
    filename: 'renderer.js',
    library: {
      type: 'umd',
    },
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // Extract CSS into a separate file
          'css-loader', // Translates CSS into CommonJS
          'postcss-loader', // Automatically uses the postcss.config.js file
        ],
      },
    ],
  },

  plugins: [
    // Development Keys - See README.md
    new webpack.EnvironmentPlugin({
      OAUTH_CLIENT_ID: 'Ov23liQIkFs5ehQLNzHF',
      OAUTH_CLIENT_SECRET: '404b80632292e18419dbd2a6ed25976856e95255',
    }),

    // Extract CSS into a separate file
    new MiniCssExtractPlugin({
      filename: 'styles.css', // Output file for the CSS
    }),

    // Generate HTML file with script and link tags injected
    new HtmlWebpackPlugin({
      filename: path.join('index.html'),
      template: path.join(webpackPaths.srcRendererPath, 'index.html'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      isBrowser: false,
    }),

    // Twemoji SVGs for Emoji parsing
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(
            webpackPaths.nodeModulesPath,
            '@discordapp/twemoji',
            'dist',
            'svg',
          ),
          to: 'images/twemoji',
          // Only copy the SVGs for the emojis we use
          filter: (resourcePath) => {
            return ALL_EMOJI_SVG_FILENAMES.some((filename) =>
              resourcePath.endsWith(`/${filename}`),
            );
          },
        },
      ],
    }),
  ],
};

export default merge(baseConfig, configuration);
