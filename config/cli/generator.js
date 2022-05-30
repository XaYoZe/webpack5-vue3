// 使用模板生成项目
const fs = require('fs');
const path = require('path');
const Yeoman = require('yeoman-environment'); // 环境设置
const logger = require('yeoman-environment/lib/util/log')
const Generator = require('yeoman-generator'); // 生成
module.exports = class extends Generator {
  // 创建空白文件夹
  createNullDir (form, to) {
    if (!form) return;
    let dir = fs.readdirSync(form, {withFileTypes: true});
    dir.forEach(dirent => {
      // 是否是文件夹
      if (dirent.isDirectory()) { 
        let subPath = path.resolve(form, dirent.name);
        this.createNullDir(subPath, path.resolve(to || form, dirent.name));
      }
    })
    // 文件夹内没东西
    if (!dir.length) {
      fs.mkdirSync(to, {recursive: true})
      this.log.create(to);
    }
  }
  /**
   * 
   * @param {*} params {name: 项目文件名， store：是否使用vuex，router：是否使用路由}
   */
  constructor () {
    super([], { 
      // 自定义环境
      env: Yeoman.createEnv([], {
        // 设置执行命令目录，可通过this.destinationPath()获取
        // cwd: path.resolve('./src', params.name)
      }),
      // 设置模板目录，可通过this.templatePath()获取
      resolved: path.resolve(__dirname, './templates')
    });
    this.log = logger();
    // this.params = params;
  }
  async prompting () { // 触发交互
    const srcList = fs.readdirSync(path.resolve('./src'));
    // 设置问题
    const prompt = [
      {
        name: "name",
        type: 'input',
        message: "請輸入項目名",
        validate (val) {
          if (val === '') return '項目名不能為空';
          if (srcList.indexOf(val) !== -1) return '已經存在相同名字的項目名'
          return true
        }
      },
      {
        name: "store",
        type: 'confirm',
        message: "使用vuex?",
        default: true
      },
      {
        name: "router",
        type: 'confirm',
        message: "使用vue-router?",
        default: true
      }
    ]
    // 設置交互問題
    let res = await this.prompt(prompt);
    let proj = path.resolve('./src', res.name);
    if (!fs.existsSync(proj)) { // 判断有无文件夹存在，无则创建
      fs.mkdirSync(proj);
    }
    this.params = res;
  }
  writing() { 
    // 对象解构
    let {name, store, router} = this.params;
    // 模板目录，该方法获取模板目录
    let templatePath = this.templatePath(); 
    //let destinationPath =  this.destinationPath(), // 目标目录，该方法获取执行命令目录
    let destinationPath = path.resolve('./src', name)
    this.log.info(`生成项目:${name}`);
    this.log.info(`目录：${this.destinationPath()}`);
    this.log.info(`使用vuex：${store}`);
    this.log.info(`使用router：${router}`);
   
    // 复制模板，使用ejs语法
    // 如不设置环境或模板文件夹，需要自己指定文件路径
    this.fs.copyTpl(
      templatePath, 
      destinationPath, // 目标目录
      {name, store, router},   // 给模板传参
    );
    // 选择不适用store不安装则删除store文件夹
    if (!store) {
      this.fs.delete(path.resolve(destinationPath, 'store'));
    }
    // 选择不使用router则删除router以及pages文件夹
    if (!router) {
      this.fs.delete(path.resolve(destinationPath, 'router'));
      this.fs.delete(path.resolve(destinationPath, 'pages'));
      // this.fs.delete(this.destinationPath('router'));
      // this.fs.delete(this.destinationPath('pages'));
    }
    // 创建空文件夹, 解决模板不复制空文件夹问题
    this.createNullDir(
      templatePath, // 模板目录，该方法获取模板目录
      destinationPath, // 目标目录
    )
  }
  end() {
    this.log.ok('生成项目模板完成');
  }
}