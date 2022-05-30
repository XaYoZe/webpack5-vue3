# 简易生成项目模板
## 工具：
- 脚手架生成工具yeoman-generator
  1. initializing -- 初始化方法（检查状态、获取配置等）
  2. prompting -- 获取用户交互数据（this.prompt()）
  3. configuring -- 编辑和配置项目的配置文件
  4. default -- 如果generator内部还有不符合任意一个任务队列任务名的方法，将会被放在default这个任务下进行运行
  5. writing -- 填充预置模板
  6. conflicts -- 处理冲突（仅限内部使用）
  7. install -- 进行依赖的安装（eg：npm，bower）
  8. end -- 最后调用，做一些clean工作
- 控制台交互工具inquirer
- 模板复制mem-fs-editor

## 使用方法：
根目录下运行命令
```
yarn createProj
或
npm run createProj
```
## 文档链接：
 [参考](https://www.jianshu.com/p/93211004c5ac)  
 [inquirer](https://github.com/SBoudrias/Inquirer.js)  
 [mem-fs-editor](https://github.com/SBoudrias/mem-fs-editor)
 [yeoman-environment](https://yeoman.github.io/generator/Generator.html)  
 [yeoman-generator](http://yeoman.github.io/environment/2.x/Environment.html)
 [ejs语法](https://ejs.co/)  