import { createRouter, createWebHashHistory } from 'vue-router'
// import index from '@src/pages/home'
let home = () => import('@src/pages/home.vue');
let keyBoard = () => import('@src/pages/keyBoard.vue')
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/index', name: 'home', component: home},
    { path: '/keyBoard', name: 'keyBoard', component: keyBoard},
    { path: '/:path(.*)*', name: 'not-found', component:  home} // 默认路由
  ]
})
export default router;
