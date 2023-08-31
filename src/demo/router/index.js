import { createRouter, createWebHashHistory } from 'vue-router'

// 自动祖册路由，会全部打包到index.js
let routeList = [];
let webpackContext = require.context('@pages', false, /.vue$/, )
webpackContext.keys().forEach(item => {
  // let cpt = webpackContext(item);
  let routeName = item.replace(/(.*?\/)+(.*)\.vue/, '$2');
  routeList.push({path: `/${routeName}`, name: routeName, component: async () => webpackContext(item)});
})

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...routeList,
    { path: '/:path(.*)*', name: 'not-found', redirect: routeList[0]} // 默认路由
  ]
})
export default router;
