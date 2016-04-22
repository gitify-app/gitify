var webpack = require('webpack');

module.exports = {
  debug: true,
  devtool: 'cheap-module-eval-source-map',

  entry: {
    dev: 'webpack-dev-server/client?http://0.0.0.0:3000',
    app: './src/js/app.js'
  },

  output: {
    path: __dirname + '/build/js',
    filename: '[name].js',
    publicPath: 'http://localhost:3000/build/js/'
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true,
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    })
  ],

  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'react', 'stage-0']
      }
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  }
};
