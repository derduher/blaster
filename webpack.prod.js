const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')
// const MinifyPlugin = require('babel-minify-webpack-plugin')

module.exports = merge(common, {
  devtool: 'source-map',
  mode: 'production',
  plugins: [
    // new MinifyPlugin(),
    new webpack.HashedModuleIdsPlugin()
  ]
})
