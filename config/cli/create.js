const Generator = require('./generator'); 
const path = require('path');
const fs = require('fs');
// 查找空白文件夹
// function 
// findNullDir(path.resolve(__dirname, './templates'), path.resolve('./src', './4'))
const generator = new Generator();
generator.run();