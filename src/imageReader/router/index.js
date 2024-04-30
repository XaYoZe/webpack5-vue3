import { createRouter, createWebHashHistory } from 'vue-router'
import home from '@src/page/home'
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {path: '/home', component: home},
    {path: '/:path(.*)*', name: 'not-found', component: home}
  ]
})
export default router;
