// postcss插件, 樣式自動添加webp
let postcss = require('postcss');
let path = require('path');
const plugin = postcss.plugin('postcss-webp', function (options) {
    return (css, c, d) => {
        let webRuleList = [];
        // 遍歷樣式
        css.walkDecls(/^((background)|(border))(-image|\b)$/, decl => {
             // 包含url樣式
            if (/url\(.*\)/.test(decl.value)) {
                // 重寫選擇器
                const selector = createPrefixSelector(decl.parent.selector);
                // 克隆
                let webpRule = decl.parent.clone({
                    selector,
                });
                webpRule.raws.semicolon = true;
                webpRule.raws.after = ' ';
                // 清空
                webpRule.removeAll();
                // 重寫樣式
                webpRule.append(decl.clone({
                    prop: decl.prop,
                    value: decl.value.replace(/url\("(.*?)"\)/g, (a,url) => {
                        let src = replaceSrc(url, decl.source.input.file);
                        return 'url("' + src + '#webp")'
                    })
                }))
                webRuleList.push(webpRule);
            }
        })
        css.append(...webRuleList);
    };
});

function replaceSrc (url, filePath) {
    if (/^~?@.*?\//.test(url)) {
        return url.replace(/^~/, '');
    } else if (!/^(https?:)?\/\//i.test(url)) {
        return url;
    } else {
        return path.relative(path.dirname(filePath), filePath)
    };
    // let resPath =  alias[curAlias];
    // return url.replace(/^~?(@.*?\/.*)/, `${resPath}/$1`);
}
// 给选择器添加前缀
function createPrefixSelector (selector) {
    // 匹配html或:root;
    let rootSelectReg = /(\bhtml|:\broot)\b/g;
    let selectorArr = selector.split(/\s+?,\s+?/);
    let newSelectorArr = selectorArr.map(selectorItem => rootSelectReg.test(selectorItem) ? selectorItem.replace(rootSelectReg, '$1.webp') : `:root.webp ${selectorItem}`);
    return newSelectorArr.join(', ');
}

module.exports = plugin;