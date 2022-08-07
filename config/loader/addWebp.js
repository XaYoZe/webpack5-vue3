// 添加兼容webp样式
let sourceText = '';
module.exports = function (source, map, meta, b, c, d, e, f) {
  // console.log(source);
  sourceText = source; 
  // let option = loaderUtils.getOptions(this);
  return extractCss(source)//source.replace(/url\((.*?)\)/g, `url($1?webp)`);
}

// 检查符合类型
function checkImageType (name) {
  // 包含类型
  let includeTypeReg = /.(jpeg|png|jpg)$/;
  // 动态匹配图片变量正则
  let importReg = new RegExp(`var ${name} = ___CSS_LOADER_GET_URL_IMPORT___\\((.*)\\);`);
  let importVar = importReg.exec(sourceText)[1];
  // 动态匹配图片地址正则
  let pathReg = new RegExp(`import ${importVar} from "(.*)";`);
  let pathRes = pathReg.exec(sourceText);
  return includeTypeReg.test(pathRes)
}
// 提取样式
function extractCss(source) {
  // 从css-loader返回source提取样式文本
  let cssReg = /\/\/ Module\n___CSS_LOADER_EXPORT___\.push\(\[module\.id,\s+?"(.*)",\s+?".*"\]\);/;
  let cssText = cssReg.exec(source)?.[1];
  if (!cssText) {
    return source;
  }
  // 按照选择器分块
  let styleReg = /(.*?)\{(.*?)\}/g;
  // 匹配url
  let urlReg = /url\(.*?\)/;
  // 所有样式
  let allStyle = {};
  // 包含url的样式
  let hasUrlStyle = {};
  // 临时存储正则结果
  let styleExceRes = '';
  while (styleExceRes = styleReg.exec(cssText)) {
    let [,selector, style] = styleExceRes;
    allStyle[selector] = style;
    // 包含url的样式
    if (urlReg.test(style)) {
      hasUrlStyle[selector] = style;
    }
  }
  let newStyle = createStyle(hasUrlStyle);
  return source.replace(cssText, cssText+newStyle)
}

// 获取样式url
function createStyle(styleObj) {
  // 
  let urlReg = /url\((.*?)\)/g;
  let urlReg1 = /url\((.*?)\)/g;
  let replacemenReg = /" \+ (.*) \+ "/;
  let urlExecRes = '';
  let newStyle = '';
  for (let selector in styleObj) {
    while (urlExecRes = urlReg.exec(styleObj[selector])) {
      let url = urlExecRes[1];
      // url变量名
      let replacemen = replacemenReg.exec(url)[1];
      if (checkImageType(replacemen)) {
        let newSelector = createPrefixSelector(selector);
        let newStyleText = styleObj[selector].replace(urlReg1, 'url($1?webp)')
        newStyle+= `${newSelector}{${newStyleText}}`;
        // newStyle[newSelector] = newStyleText;
      }
    }
  }
  return newStyle;
}

// 给选择器添加前缀
function createPrefixSelector (selector) {
  // 匹配html或:root;
  let rootSelectReg = /(\bhtml|:\broot)\b/g;
  let selectorArr = selector.split(/\s+?,\s+?/);
  let newSelectorArr = selectorArr.map(selectorItem => rootSelectReg.test(selectorItem) ? selectorItem.replace(rootSelectReg, '$1.webp') : `:root.webp ${selectorItem}`);
  return newSelectorArr.join(', ');
}