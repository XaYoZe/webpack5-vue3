import { createApp } from 'vue';
import index from './index.vue';
import '@src/assets/style/index.scss'
<% if (store) { %>import store from '@src/store';<% } %>
<% if (router) { %>import router from '@src/router';<% } %>

if (!window.eruda && RUN_ENV === 'local' && IS_PHONE) {
  let debugToolsSrc = 'https://cdnjs.cloudflare.com/ajax/libs/eruda/2.4.1/eruda.min.js'
  let debugToolsDom = document.createElement('script')
  debugToolsDom.src = debugToolsSrc;
  document.body.append(debugToolsDom);
  debugToolsDom.onload = () => {
    eruda.init();
  }
}

let app = createApp(index); 

<% if (store) { %>app.use(store); // 使用状态管理<% } %>
<% if (router) { %>app.use(router); // 使用路由管理<% } %>
app.mount('#app'); // 只能在use之后使用