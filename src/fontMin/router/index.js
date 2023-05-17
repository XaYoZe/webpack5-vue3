import { createRouter, createWebHashHistory } from 'vue-router'
import index from '@src/pages/home'
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {path: '/index', name: 'home', component: index},
    { path: '/:path(.*)*', name: 'not-found', component: index } // 默认路由
  ]
})
export default router;
