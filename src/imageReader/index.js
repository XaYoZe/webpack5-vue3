import { createApp } from 'vue';
import index from './index.vue';
import store from '@src/store'
import router from '@src/router'
import '@src/assets/style/index.scss'

let app = createApp(index); 

app.use(store); // 使用状态管理
app.use(router); // 使用路由管理
app.mount('body'); // 只能在use之后使用