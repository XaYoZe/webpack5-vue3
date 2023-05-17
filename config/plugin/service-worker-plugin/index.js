/*
 * 自动添加清除缓存代码到html顶部,以构建时间为判断依据
 */
const HtmlWebpackPlugin = require("html-webpack-plugin"),
  webpack = require("webpack"),
  uglify = require("uglify-js"),
  fs = require("fs"),
  path = require("path");

class ServiceWorkerPlugin {
  defaultOptions = {
    buildTime: Date.now(),
    projName: "proj",
    outputName: "sw.js",
  };
  constructor (options) {
    this.buildTime = options.buildTime || this.defaultOptions.buildTime;
    this.projName = options.projName || this.defaultOptions.projName;
    this.outputName = options.outputName || this.defaultOptions.outputName;
  }
  apply(compiler) {
    // 使用 compilation 生命周期保证 plugin 执行在 文件创建之前
    // compiler 创建的 compilation 对象在回调中被使用
    compiler.hooks.compilation.tap(
      ServiceWorkerPlugin.name,
      (compilation, callback) => {
        // 将逻辑注册在同一个 ServiceWorkerPlugin 方法上
        HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tap(
          ServiceWorkerPlugin.name,
          (res) => {
            // 插入内嵌代码
            let filePath = path.resolve(__dirname, "./injectScript.js");
            let minifyCode = this.minifyJsCode(filePath, {
              buildTime: this.buildTime,
              projName: this.projName,
              outputName: this.outputName,
              isDev: process.env.WEBPACK_SERVE
            });
            res.headTags.unshift({
              tagName: "script",
              voidTag: false,
              innerHTML: minifyCode,
              attributes: { defer: false, type: undefined },
            });
          }
        );
        compilation.hooks.processAssets.tapAsync(
          {
            name: ServiceWorkerPlugin.name,
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
          },
          (assets, callback) => {
            let assetSkeys = Object.keys(assets);
            if (assetSkeys.length) {
              // 文件路径
              let filePath = path.resolve(__dirname, "./serviceWorker.js");
              let minifyCode = this.minifyJsCode(filePath, {
                cacheFileList: JSON.stringify(assetSkeys),
              });
              // 将JavaScript文件添加到Webpack的输出中
              assets[this.outputName] = new webpack.sources.RawSource(
                minifyCode
              );
              // 写入打包时间
              assets["version"] = new webpack.sources.RawSource(
                String(this.buildTime)
              );
            }
            callback();
          }
        );
      }
    );
  }
  // 替换参数值
  replaceText(src, params) {
    let str = src;
    for (let prop in params) {
      str = str.replace(new RegExp("\\$" + prop + "\\$", "g"), params[prop]);
    }
    return str;
  }
  // 压缩js代码
  minifyJsCode(path, params = {}) {
    try {
      let fileContent = this.replaceText(
        fs.readFileSync(path, { encoding: "utf-8" }),
        params
      );
      let minify = null;
      if (process.env.WEBPACK_SERVE == "true") {
        minify = { code: fileContent };
      } else {
        // 壓縮代碼
        minify = uglify.minify(fileContent, {
          mangle: true,
          compress: {
            drop_console: false,
          },
          output: {
            comments: false,
          },
        });
        if (!minify.code && minify.error) {
          throw filePath + "\n" + minify.error.message;
        }
      }
      return minify.code;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = ServiceWorkerPlugin;
