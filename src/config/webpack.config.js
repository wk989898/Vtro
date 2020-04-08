const path=require('path')
const { VueLoaderPlugin } = require("vue-loader");

module.exports={
  mode:'production',
  entry:path.resolve(__dirname,'../index.js'),
  output:{
    filename:'bundle.js',
    path:path.resolve('lib')
  },
  resolve:{
    alias:{
      '@':'./src'
    },
    extensions:['.js','.json','.vue','.css']
  },
  module:{
    rules:[
      {test:/\.vue$/,use:['vue-loader']},
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
    new VueLoaderPlugin()
  ],
  devtool:'source-map',
  externals:{
    electron:'electron'
  }
}