const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const { VueLoaderPlugin } = require("vue-loader")

const banner=
`/**
*   Vtro
*   a trojan client for windows
*   by wk989898
*   repository https://github.com/wk989898/Vtro
*/`

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, '../index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve('lib')
  },
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
        terserOptions: {
          output: {
            comments: false,
            preamble:banner
          }
        }
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
  ],

  externals: {
    electron: 'electron'
  },
  devtool: 'source-map',
  watchOptions: {
    ignored: /node_modules/
  }
}