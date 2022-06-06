const webpack = require('webpack');
const webpackMerge = require('webpack-merge'); // 配置合并方法
const common = require('./webpack.common.js'); // 公用配置， 因为用到global.proj变量，所以在后面赋值后引入
const path = require('path');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const htmlAddScript = require('./plugin/htmlAddScript');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = env => {
  const proj = Object.keys(env).filter(key => /^:.*/.test(key))[0].slice(1);
  const outputPath = path.resolve(__dirname, `../dist/${proj}/`);
  return webpackMerge.merge(common(env), {
    mode: 'production', // 生產模式
    externals: {
      vue: 'Vue'
    },
    devtool: false, // map映射
    optimization: {
      minimize: true, // 开发环境不压缩
      /* 环境变量标识 */
      runtimeChunk: {
        name: 'manifest',
      },
      splitChunks: {
        minSize: 0,
        cacheGroups: {
          vendor: {
            // 优先级高于其他就不会被打包进其他chunk,如果想匹配自己定义的拆分规则，则priority需要设置为正数，优先匹配默认拆分规则就设置为负数。
            priority: 10,
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
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
      minimizer: [
          new ESBuildMinifyPlugin({
            target: 'es2015',  // Syntax to compile to (see options below for possible values)
            minify: true,
            css: true
          })
      ],
    },
    plugins: [
      new htmlAddScript([
        'http://cdn.staticfile.org/vue/3.2.11/vue.global.min.js' // 添加vue库
      ]),
      new CompressionPlugin({
            algorithm: "gzip",
            test: /\.(css|js|png|jpg|jpeg)$/,
            minRatio: 0.8,
      })
    ]
  });
}
