import { Plugin, inject,  defineAsyncComponent, Component, DefineComponent } from "vue";
import { StoreDefinition } from 'pinia';
import usePopupStore from './popup'
import PopupCtrl from './PopupCtrl.vue';

declare module 'vue' {
  /** 彈窗組件 */
  function inject(key: 'popupStore'): ReturnType<typeof usePopupStore>;
}

const Config: Plugin = {
  install (app, options) {
    app.component('PopupCtrl', PopupCtrl);
    // 注册弹窗异步组件
    const cmts = require.context('@cpts/popup', true, /\/.*?\.vue$/, 'lazy');
    cmts.keys().forEach(key => {
      const name  = key.match(/\/([^\/]*?)\.vue$/)[1];
      if (!app?._context?.components[name]) {
        const syncCmt = defineAsyncComponent(() => cmts(key));
        app.component(name, syncCmt)
      }
    })
    app.provide('popupStore', usePopupStore());
  }
}

// 彈窗組將擴展使用
interface PopupComponent {
}


export default Config

export { usePopupStore, PopupComponent }