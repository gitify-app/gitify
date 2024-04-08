const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      // Development Keys - See README.md
      OAUTH_CLIENT_ID: '3fef4433a29c6ad8f22c',
      OAUTH_CLIENT_SECRET: '9670de733096c15322183ff17ed0fc8704050379',
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'build', 'js'),
  },
};
