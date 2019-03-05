const path = require('path');
const uglify = require('uglifyjs-webpack-plugin'); //js压缩插件
const htmlPlugin = require('html-webpack-plugin'); //实现html打包功能，引用好路径的到html来
const glob = require('glob');
const CleanWebpackPlugin = require('clean-webpack-plugin');// 打包前先清空dist
const MiniCssExtractPlugin = require("mini-css-extract-plugin");//分离js中的css
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");//css压缩
const webpack = require('webpack');

const devMode = process.env.NODE_ENV !== 'production';

var website = {
  publicPath: "http://localhost:8888/"
  // publicPath:"http://192.168.1.103:8888/"
}

function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer);
  } else if (m.name) {
    return m.name;
  } else { 
    return false;
  }
}

module.exports = {
  mode: 'production', // 模式配置 production,development
  entry: { //入口文件配置
    main: path.resolve(__dirname, './src/main.js'),
    main2: path.resolve(__dirname, './src/main2.js'),
  },
  output: { //出口文件配置
    //path.resolve把一个路径或路径片段的序列解析为一个绝对路径
    path: path.resolve(__dirname, './dist'), // 打包后的目录，必须是绝对路径
    filename: '[name].[hash:4].js', // [name]打包后的文件名称,进入是什么名字出来也是
    chunkFilename: '[name].[hash].js',//文件开启按需加载后，会生成多个小文件
    // 2.添加hash可以防止文件缓存，每次都会生成4位的hash串
    // filename: 'bundle.[hash:4].js',   
    // path: path.resolve(__dirname, '../dist')
    publicPath: website.publicPath //publicPath：主要作用就是处理静态文件路径的。
  },
  //模块，例如解读CSS，图片转换，压缩
  module: {
    rules: [
      //babel 配置
      {
        test:/\.(jsx|js)$/,
        use:{
            loader:'babel-loader?cacheDirectory',//loader的cacheDirectory选项，开启后用缓存，提升打包速度
        },
        include: /src/,          // 只转化src目录下的js
        exclude:/node_modules/   //排除
      },
      //css loader
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
           MiniCssExtractPlugin.loader,//js分离css,使用style-loader不会分离
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      //图片(主要css中) loader
      {
        test: /\.(png|jpg|gif|jpeg)/, //是匹配图片文件后缀名称
        use: [{
          loader: 'url-loader', //是指定使用的loader和loader的配置参数
          options: {
            limit: 500, //是把小于500B的文件打成Base64的格式，写入JS
            outputPath: 'images/', //打包后的图片放到images文件夹下
          }
        }]
      },
      // 引用字体图片和svg图片
      {
          test: /\.(eot|ttf|woff|svg)$/,
          use: 'file-loader'
      },
      // HTML中的图片
      {
        test: /\.(htm|html)$/i,
        use: ['html-withimg-loader']
      },
     
    ]
  },
  optimization: {
    // minimize:true,//如果mode是production类型，minimize的默认值是true，执行默认压缩，
    minimizer:[],
    splitChunks: { 
// chunks: "async",//三个个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
// 值为all/initial/async/function(chunk),值为function时第一个参数为遍历所有入口chunk时的chunk模块，
// chunk._modules为chunk所有依赖的模块，
// 通过chunk的名字和所有依赖模块的resource可以自由配置,
// 会抽取所有满足条件chunk的公有模块，以及模块的所有依赖模块，包括css
// minSize: 30000,  //表示在压缩前的最小模块大小,默认值是30kb
// minChunks: 1,  // 表示被引用次数，默认为1；
// maxAsyncRequests: 5,  //所有异步请求不得超过5个,最大的按需(异步)加载次数.默认为1;
// maxInitialRequests: 3,  //初始话并行请求不得超过3个,最大的初始化加载次数，默认为1；
// automaticNameDelimiter:'~',//名称分隔符，默认是~
// name: true,  //打包后的名称，默认是chunk的名字通过分隔符（默认是～）分隔
      cacheGroups: {//设置缓存组用来抽取满足不同规则的chunk,下面以生成common为例
        common: {
          name: 'common',  //抽取的chunk的名字
          chunks(chunk) { //同外层的参数配置，覆盖外层的chunks，以chunk为维度进行抽取
          },
          test(module, chunks) {  //可以为字符串，正则表达式，函数，以module为维度进行抽取，
            // 只要是满足条件的module都会被抽取到该common的chunk中，
            // 为函数时第一个参数是遍历到的每一个模块，第二个参数是每一个引用到该模块的chunks数组。
            // 自己尝试过程中发现不能提取出css，待进一步验证。
          },
          // priority: 10,  //优先级，一个chunk很可能满足多个缓存组，会被抽取到优先级高的缓存组中
          // minChunks: 2,  //最少被几个chunk引用
          // reuseExistingChunk: true,//  如果该chunk中引用了已经被抽取的chunk，直接引用该chunk，不会重复打包代码
          // enforce: true  // 如果cacheGroup中没有设置minSize，则据此判断是否使用上层的minSize，true：则使用0，false：使用上层minSize
        },
        fooStyles: {
          name: 'main',
          test: (m,c,entry = 'main') => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
          chunks: 'all',
          enforce: true
        },
        barStyles: {
          name: 'main2',
          test: (m,c,entry = 'main2') => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  //插件，用于生产模版和各项功能
  plugins: [
    new CleanWebpackPlugin('dist'),  // 打包前先清空
    new uglify(
      // {//js压缩插件
      // cache: false,//启用文件缓存
      // parallel: true,//使用多进程并行运行来提高构建速度
      // sourcMap: true//使用源映射将错误消息位置映射到模块（这会减慢编译速度）
      // }
    ),
    new MiniCssExtractPlugin({//分离js中的css
      // 类似 webpackOptions.output里面的配置 可以忽略
      //  filename，对应于entry里面生成出来的文件名
      //  chunkFilename，未被列在entry中，却又需要被打包出来的文件命名配置，如异步加载的模块文件
       filename: devMode ? 'css/[name].css' : '[name].[hash].css',//可以更变文件产生路径
       chunkFilename: devMode ? 'css/[id].css' : '[id].[hash].css',
   }),
   new OptimizeCSSAssetsPlugin({//css压缩
    // assetNameRegExp: /\.main\.css$/g,//一个正则表达式，指示应优化\最小化的文件的名称。
    // cssProcessor: require('cssnano'),//用于优化\最小化CSS的CSS处理器，默认为cssnano
    // cssProcessorPluginOptions: {},//传递给cssProcessor的选项，默认为 {}
    // canPrint: true//一个布尔值，指示插件是否可以将消息打印到控制台，默认为 true
   }),
    new htmlPlugin({
      minify: { //是对html文件进行压缩
        removeAttributeQuotes: true //removeAttrubuteQuotes是却掉属性的双引号。
      },
      hash: true, //为了开发中js有缓存效果，所以加入hash，这样可以有效避免缓存JS。
      template: './src/index.html' //是要打包的html模版路径和文件名称。
    }),
    new webpack.HotModuleReplacementPlugin(), // 热更新，热更新不是刷新
  ],
  //配置webpack开发服务功能,npm install webpack-dev-server
  devServer: {
    //设置基本结构
    contentBase: path.resolve(__dirname, '../dist'),
    host: 'localhost',//服务器IP地址,可以是localhost
    compress: true,//服务端压缩是否开启
    open: true,// 自动打开浏览器
    hot: true ,// 开启热更新
    port: 8888
  }
}