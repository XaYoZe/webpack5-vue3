import { createRouter, createWebHashHistory } from 'vue-router'
import index from '@src/page/home'
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {path: '/index', component: index},
    {path: '/:path(.*)*', name: 'not-found', component: index}
  ]
})
export default router;
