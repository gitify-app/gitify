var webpack = require('webpack');

module.exports = {
  debug: true,
  devtool: 'source-map',

  entry: {
    app: './src/js/app.js'
  },

  output: {
    path: __dirname + '/build/js',
    filename: '[name].js'
  },

  plugins: [
    new webpack.NoErrorsPlugin()
  ],

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-0']
        }
      }, {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loaders: ['style', 'css', 'sass']
      },
    ]
  }
};
