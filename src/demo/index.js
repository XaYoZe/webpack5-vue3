import { createApp } from 'vue';
import index from './index.vue';
import '@src/assets/style/index.scss'
import router from '@router/index';
import { createPinia } from 'pinia'
import PopupCtrl from 'PopupCtrl';


if (!window.eruda && RUN_ENV === 'local' && location.href.indexOf('debug') !== -1) {
  let debugToolsSrc = 'https://cdnjs.cloudflare.com/ajax/libs/eruda/2.4.1/eruda.min.js'
  let debugToolsDom = document.createElement('script')
  debugToolsDom.src = debugToolsSrc;
  document.body.append(debugToolsDom);
  debugToolsDom.onload = () => {
    window.eruda.init();
  }
}

let app = createApp(index); 

// 自動註冊組件
let webpackContext = require.context('@cpts', true, /.vue$/, 'sync')

webpackContext.keys().forEach(item => {
  let cpt = webpackContext(item);
  app.component(cpt.default.name || item.replace(/(.*?\/)+(.*)\.vue/, '$2'), cpt.default)
})

app.use(router); // 使用路由管理
app.use(createPinia());
app.use(PopupCtrl);

app.mount('#app'); // 只能在use之后使用