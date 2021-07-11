const path = require('path')
const slsWebpack = require('serverless-webpack')

module.exports = {
  target: 'node',
  mode: slsWebpack.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsWebpack.lib.entries,
  devtool: 'source-map',
  resolve: {
    extensions: ['.json', '.ts', '.js']
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader', options: { transpileOnly: true } }
    ]
  }
}
