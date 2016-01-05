var webpack = require('webpack');

module.exports = {
  context: __dirname + '/src/js',
  entry: './app.js',
  output: {
    path: __dirname + '/build/js',
    filename: 'app.js'
  },
  devtool: 'source-map',
  plugins: [
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'react']
      }
    }]
  }
};
