const webpackMerge = require('webpack-merge');
const common = require('./webpack.common'); // 公用配置， 因为用到global.proj变量，所以在后面赋值后引入
const net = require('net');

 // 端口佔用檢測
function testPort (port, host) {
  let server = net.createServer().listen(port, host); // 使用端口開啟服務
  return new Promise((res) => {
    server.on('listening', () => { // 開啟服務成功, 端口可使用
      server.close(); // 關閉服務
      res(port); // 繼續執行
    });
    server.on('error', async (err) => { // 開啟服務失敗
      if (err.code === 'EADDRINUSE') { // 端口已经被使用
        res(await testPort(port + 1, host));
      }
    })
  })
}
console.log(this);

  module.exports = async function( env) {
  console.log(this);
  let port = 8080; // 端口
  let host = '0.0.0.0'; // 域名
  return webpackMerge.merge(common(env), {
    // 原始源代码（仅限行）
    devtool: 'cheap-module-source-map',
    // mode:'development', // 模式,'development' 开发 或 'production'生产
    devServer:{         //开发服务配置
      // publicPath: '/',
      // contentBase: `/static`, // 項目路徑
      // contentBasePublicPath: '/static',
      // bonjour: {  // 这个配置用于在启动时通过 ZeroConf 网络广播你的开发服务器。
      //   type: 'http',
      //   protocol: 'udp'
      // },
      client: {
        logging: 'none', // 允许在浏览器中设置日志级别 'log' | 'info' | 'warn' | 'error' | 'none' | 'verbose'
        overlay: { errors:true, warnings: false }, // 当出现编译错误或警告时，在浏览器中显示全屏覆盖。
        progress: false,  // 在浏览器中以百分比显示编译进度。
        reconnect: 20, // 告诉 dev-server 它应该尝试重新连接客户端的次数。当为 true 时，它将无限次尝试重新连接。
      },
      static: false,
      host, // 設為0.0.0.0才能在局域網內訪問
      port: await testPort(port, host), // 端口
      open: false, // 啟動後自動打開瀏覽器
      hot: true // 熱替換，自动使用webpack.HotModuleReplacementPlugin插件
    },
    plugins: [
    ]
  })
};
