const HtmlWebpackPlugin = require('html-webpack-plugin'); // html模板插件
const { createHtmlTagObject, htmlTagObjectToString, HtmlTagArray } = require('html-webpack-plugin/lib/html-tags');

module.exports = class htmlAddScript {
  constructor (tagList) {
    this.tagList = Array.isArray(tagList) ? tagList : [tagList];
    this.singleTag = [];
    this.singleTag = [];
    this.pluginName = 'htmlAddScript';
    this.urlTagReg = [
      {tagName: 'script', attributes: {}, reg: /\.js\??/, linkType: 'src' },
      {tagName: 'link', attributes: {rel: "stylesheet"}, reg: /\.css\??/, linkType: 'href'}
    ]
  }
  apply (compiler) {
    // webpack生命週期鉤子
    compiler.hooks.compilation.tap(this.pluginName, (compilation => {
      // HtmlWebpackPlugin插件生命週期鉤子
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(this.pluginName, (data, cb) => {
          // 生成標籤
          this.tagList.forEach(item => {
            data[item.inject === 'body' ? 'bodyTags' : 'headTags'].push(this.createTag(item));
          });
          cb(null, data)
        }
      )
    }))
  }
  /**
   * 
   * @param { string|{
     tagName: string,
     attributes: string,
     content: string,
    }} config 鏈接或配置對象
   * @returns { object }
   */
  createTag (config) {
    if (typeof config === 'string') {
      let tagName = '';
      let attributes = {};
      for (let index in this.urlTagReg) {
        if (this.urlTagReg[index].reg.test(config)) {
          tagName = this.urlTagReg[index].tagName;
          attributes = {...this.urlTagReg[index].attributes, [this.urlTagReg[index].linkType]: config}
          break;
        }
      }
      return createHtmlTagObject(tagName, attributes);
    }
    return createHtmlTagObject(config.tagName, config.attributes, config.content);
  }
}