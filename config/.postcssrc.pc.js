let path = require('path')
module.exports = {
  "plugins": [
    // path.resolve(__dirname, './plugin/postcss-webp.js'),
    {
        'postcss-preset-env': {
          // "browsers": "config/.browserslistrc",
          "browsers": "> 1%",
          // "browserslist" : [
          //   "> 1%", // 代表着全球超过1%人使用的浏览器
          //   "last 2 versions", // 表示所有浏览器兼容到最后
          //   "not ie <= 8", // 表示IE浏览器版本大于8
          //   "Chrome >= 20",
          //   "Firefox >= 20", 
          //   "Android >= 5", // 表示安卓版本大于5
          //   "safari >= 7" // 表示safari浏览器版本大于等于7
          // ],
        },
        // 'postcss-px-to-viewport': {
        //   unitToConvert: "px", // 要转化的单位
        //   viewportWidth: 1920, // UI设计稿的宽度
        //   unitPrecision: 6, // 转换后的精度，即小数点位数
        //   propList: ["*"], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
        //   viewportUnit: "vw", // 指定需要转换成的视窗单位，默认vw
        //   fontViewportUnit: "vw", // 指定字体需要转换成的视窗单位，默认vw
        //   selectorBlackList: ["wrap"], // 指定不转换为视窗单位的类名，
        //   minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
        //   mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
        //   replace: true, // 是否转换后直接更换属性值
        //   exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
        //   landscape: false // 是否处理横屏情况
        // }
      }
  ]
}