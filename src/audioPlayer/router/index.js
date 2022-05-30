import { createRouter, createWebHashHistory } from 'vue-router'
import index from '@src/page/home'
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {path: '/index', component: index}
  ]
})
export default router;
