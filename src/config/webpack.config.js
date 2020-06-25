const path = require('path')
const fs=require('fs')
const TerserPlugin = require('terser-webpack-plugin')
const { VueLoaderPlugin } = require("vue-loader")
const webpack = require('webpack');

const banner =
`
This file is part of Vtro.
Copyright (C) 2020  wk989898

Vtro is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
`
module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, '../index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve('lib')
  },
  target:'electron-renderer',
  resolve: {
    alias: {
      '@': './src'
    },
    extensions: ['.js', '.json', '.vue', '.css']
  },
  optimization: {
    sideEffects: false,
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        extractComments: false,
      })
    ]
  },
  module: {
    rules: [
      { test: /\.vue$/, use: ['vue-loader'] },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.BannerPlugin(banner)
  ],

  externals: {
    electron: 'electron'
  },
  devtool: 'source-map',
  watchOptions: {
    ignored: /node_modules/
  }
}