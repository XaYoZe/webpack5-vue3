const webpack = require('webpack');
const webpackMerge = require('webpack-merge'); // 配置合并方法
const common = require('./webpack.common.js'); // 公用配置， 因为用到global.proj变量，所以在后面赋值后引入
const path = require('path');
const ESBuildMinifyPlugin = require('esbuild-loader').EsbuildPlugin;
const htmlAddScript = require('./plugin/htmlAddScript');
const CompressionPlugin = require('compression-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = env => {
  const proj = Object.keys(env).filter(key => /^:.*/.test(key))[0].slice(1);
  const outputPath = path.resolve(__dirname, `../dist/${proj}/`);
  return webpackMerge.merge(common(env), {
    mode: 'production', // 生產模式
    output: {
      clean: true, // 在生成文件之前清空 output 目录
    },
    externals: { // 剥离不需要改变的依赖
      vue: 'Vue',
    },
    devtool: false, // map映射
    optimization: {
      minimize: true, // 生产环境压缩
      runtimeChunk: true, // 提取chunk映射到单独文件, 避免无修改文件重新打包, 影响浏览器缓存
      removeEmptyChunks: false, // 移除 chunk 为空的js
      splitChunks: { // 拆分js文件
        minSize: 0,
        cacheGroups: {
          vendor: {
            // 优先级高于其他就不会被打包进其他chunk,如果想匹配自己定义的拆分规则，则priority需要设置为正数，优先匹配默认拆分规则就设置为负数。
            priority: 10,
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/, // 引入的的依赖文件打包进这个, 剥离的不打包
            chunks: 'all',
          },
          common: {
            // 优先级高于其他就不会被打包进其他chunk,如果想匹配自己定义的拆分规则，则priority需要设置为正数，优先匹配默认拆分规则就设置为负数。
            priority: 0,
            test: /static|assets\/utils/,
            name: 'common',
            chunks: 'all',
          },
        },
      },
      minimizer: [ // 压缩代码工具
          new ESBuildMinifyPlugin({
            target: 'es2015',  // Syntax to compile to (see options below for possible values)
            minify: true,
            css: true
          })
      ],
    },
    plugins: [
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
      new htmlAddScript([
        'http://cdn.staticfile.org/vue/3.2.11/vue.global.min.js', // 添加vue库
      ]),
      new CompressionPlugin({
            algorithm: 'gzip', // 使用gzip压缩
            test: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i, // 匹配文件名
            threshold: 1, // 对超过10k的数据压缩 设为1, 只根据压缩率来压缩
            minRatio: 0.8, // 压缩率小于0.8才会压缩
            deleteOriginalAssets: false // 删除原资源
      })
    ]
  });
}
