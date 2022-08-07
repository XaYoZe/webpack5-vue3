const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const htmlWebpackPlugin = require('html-webpack-plugin'); // html模板插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css提取插件
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 文件複製插件
const { VueLoaderPlugin } = require('vue-loader'); // vue解析插件
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const htmlAddScript = require('./plugin/htmlAddScript');

module.exports = env => {
  // 获取环境变量，匹配: 开头的键作为项目文件名
  const proj = Object.keys(env).filter(key => /^:.*/.test(key))[0].slice(1);
  // 開發手機頁面
  const RUN_ENV = env.NODE_ENV;
  const isPhone = env.phone;
  const entryPath = path.resolve(__dirname, `../src/${proj}/`);
  const outputPath = path.resolve(__dirname, `../dist/${proj}/`);
  const NODE_ENV = (env.NODE_ENV === 'local' || env.NODE_ENV === 'beta') ? 'development' : 'production';
  const timestamp = Date.now();
  console.log('手機：', isPhone, '打包環境：', RUN_ENV)
  if (env.NODE_ENV === 'prod') {
    let versionFilePath = path.resolve(__dirname, './version.json');
    fs.readFile(versionFilePath, {encoding: 'utf-8'}, (err, data) => {
      if (err) {
        console.log(err);
        return
      }
      let version = JSON.parse(data)
      console.log(version, timestamp);
      version[proj] = timestamp;
      fs.writeFile(versionFilePath, JSON.stringify(version), {encoding: 'utf-8'}, (err) => {
        console.log(err);
      })
    });
  }
  return {
    mode: NODE_ENV,
    devtool: !(RUN_ENV === 'prod') || 'cheap-module-source-map',
    entry: {
      index: `${entryPath}/index.js`
    }, // 入口文件
    output: {
      path: outputPath, // 輸出項目路徑
      filename: 'js/[name].[chunkhash:8].js', // 文件夹名 [name]就可以将出口文件名和入口文件名一一对应
      publicPath: env.NODE_ENV === 'local' ? '/' : './' // 输出解析文件的目录
    },
    performance: {
      hints: 'warning', 
      maxAssetSize: 30000000, // 整数类型（以字节为单位）控制webpack单个资产超出限制时发出性能提示
      maxEntrypointSize: 5000000 // 整数类型（以字节为单位） 控制webpack最大入口点文件大小超出限制时发出性能提示
    },
    module: {
      rules: [{
          test: /\.(png|svg|jpe?g|gif)$/i, // 解析图片
          // include: /to64\/*/,
          // exclude: /[^\/]static/,
          type: 'asset', // 使用资源模块,自动选择
          parser: {
            dataUrlCondition: {
              maxSize: 1000 * 1024 // 大于100k转为链接， 否则转行内
            }
          },
          generator: {
            filename: 'img/[name].[hash:7][ext]', // 输出资源路径
          }
        }, {
          test: /\.(woff|woff2|eot|ttf|otf)$/, // 字体处理
          type: 'asset/source' //  导出资源的源代码。
          // use: ['file-loader']
        },  {
          test: /\.(mp4|mp3)$/, // 影像資源
          type: 'asset' //  导出资源的源代码。
          // use: ['file-loader']
        }, {
          test: /\.s?[ac]?ss$/i, // 解析css, scss, sass
          exclude: /node_modules/,
          use: [
            RUN_ENV === 'local' ? 'style-loader' : {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '../'
              }
            },
            // {
            //   loader: path.resolve(__dirname, './loader/addWebp')
            // },
            {
              loader: 'css-loader',
              options: {
                url: (url, resourcePath) => { // 过滤链接路劲
                  // resourcePath - css 文件的路径
                  // 不处理 `/static` url 下面的文件
                  if (/^\//.test(url) && url.includes("/static")) {
                    return false;
                  }
                  return true;
                }
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  config: path.resolve(__dirname, `./.postcssrc.${isPhone ? 'phone' : 'pc' }.js`),
                }
              }
            },
            {
                loader: 'sass-loader',
                options: {
                    // 使用sass
                    implementation: require("sass")
                }
            },
            {   // 全局混入scss
                loader: 'sass-resources-loader',
                options: {
                    resources: [path.resolve(__dirname, '../assets/style/mixin.scss')]
                }
            }
            // 'vue-style-loader'
          ] // 解析順序,從右到左
        },{
          test: /\.vue$/i, // .vue文件解析
          exclude: /node_modules/,
          use: [{
            loader: 'vue-loader',
            options: {
              transformAssetUrls: {
                video: ['src', 'poster'],
                audio: 'src',
                source: 'src',
                img: 'src',
                image: ['xlink:href', 'href'],
                use: ['xlink:href', 'href']
              }
            }
          }]
        }, {
          test: /\.m?js$/, // js文件解析
          exclude: /node_modules/, // 排除符合条件的模块
          use: [{
          // 开启多进程打包。 
          // 进程启动大概为600ms，进程通信也有开销。
          // 只有工作消耗时间比较长，才需要多进程打包
          //   loader: "thread-loader",
          //   options: {
          //     workers: 2,
          //     workerParallelJobs: 50,
          //     workerNodeArgs: ['--max-old-space-size=1024'],
          //     poolRespawn: false,
          //     poolTimeout: 2000,
          //     poolParallelJobs: 50,
          //     name: "my-pool"
          //   }
          // }, {
            // loader: 'babel-loader',
            // options: {
            //   cacheDirectory: true, // 开启缓存
            //   configFile: path.resolve(__dirname,'./.babelrc') // 修改配置文件位置， 默认根目录
            // }
          // }, {
            loader: 'esbuild-loader',
            options: {
              loader: 'js',  // Remove this if you're not using JSX
              target: [
                'es2015',
              ],  // Syntax to compile to (see options below for possible values)
              sourcemap: NODE_ENV !== 'prod'
            }
          }]
        }
      ]
    },
    optimization: {},
    plugins:[ // 插件
    // 图片无损压缩
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            encodeOptions: {
              mozjpeg: {
                // That setting might be close to lossless, but it’s not guaranteed
                // https://github.com/GoogleChromeLabs/squoosh/issues/85
                quality: 90, // jpg jpeg压缩比
              },
              webp: {
                lossless: 1,
              },
              avif: {
                // https://github.com/GoogleChromeLabs/squoosh/blob/dev/codecs/avif/enc/README.md
                cqLevel: 0,
              },
            },
          },
        },
      }),
      new MiniCssExtractPlugin({
        filename:
        RUN_ENV === 'local'
          ? '[name].css'
          : 'style/[name].[contenthash].css',
        chunkFilename:
        RUN_ENV === 'local' ? '[id].css' : 'style/[id].[contenthash].css',
      }), // css提取插件
      new VueLoaderPlugin(), // vue-loader 插件
      // copy custom static assets
      new CopyWebpackPlugin({ // 复制插件,将static复制到打包路径里
        patterns: [
          {
            from: path.join(entryPath, '/static'), // 从哪复制
            to: path.join(outputPath, '/static'), // 复制到哪
            noErrorOnMissing: true, // 不提示未找到文件
            globOptions: {
              dot: true,
              gitignore: true,
              ignore: ['.*']
            },
            // 
          },
        ],
      }),
      new htmlWebpackPlugin({ // html模板插件
        filename: `${outputPath}/index.html`, // 文件名
        chunks: ['index'], // 导入js文件
        inject: 'body', // 插入js位置
        minify: true,
        template: `${entryPath}/index.html`, // 模板文件位置
      }),
      new webpack.DefinePlugin({ // 編譯時定義全局變量
        IS_PHONE: isPhone, // 移動端頁面
        PEOJ_NAME: JSON.stringify(proj), // 項目文件名
        RUN_ENV: JSON.stringify(RUN_ENV), // 運行環境
        'env.NODE_ENV': JSON.stringify(NODE_ENV), // 打包環境
        __VUE_PROD_DEVTOOLS__: false, // 啟用vue生產模式調試工具devtools
        __VUE_OPTIONS_API__: true, // 啟用vue編譯器options的api
      }),
      new htmlAddScript([{ // 自己写的html文件添加标签功能
        tagName: 'script',
        content: `var timestamp = ${timestamp};`
      }, {
        tagName: 'script',
        content: `${fs.readFileSync(path.resolve(__dirname, 'clearCache.js'))}`
      }])
    ],
    resolve: {
      extensions: ['.js', '.json', 'scss', 'css', '.vue'], // 引入文件可以省略後綴
      alias: { // 別名
        '@Assets': path.resolve(__dirname, '../assets'),
        '@Config': path.resolve(__dirname, '../config'),
        '@Utils': path.resolve(__dirname, '../assets/utils'),
        '@src': entryPath,
        '@cpts': path.join(entryPath, './components'),
        '@static': path.join(entryPath, './static'),
        '@style': path.join(entryPath, './assets/style'),
        '@img': path.join(entryPath, './assets/image'),
        '@js': path.join(entryPath, './assets/js'),
        '@store': path.join(entryPath, './store'),
        '@route': path.join(entryPath, './route'),
      }
    },
    stats: {
        all: false, // 默认值
        timings: true,  // 添加时间信息
        colors: true, // 颜色
        assets: true, // 静态资源
        assetsSort: 'name', // 排序
        cachedAssets: true, //  添加关于缓存资源的信息
        errors: true
    }
  }
}