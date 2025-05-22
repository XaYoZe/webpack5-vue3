import  { DefineComponent, reactive, ref, ComputedOptions, MethodOptions, EmitsOptions, PropType } from 'vue'
import { defineStore } from 'pinia'
import { PopupComponent } from './index';

const actName = sessionStorage.getItem('RELEASE') || location.pathname.match(/\/([^\/]+)\/(?:index\.html)$/)?.[1] || 'actName';

/**
 * 彈窗配置
 */
interface PopupConfig {
  /** 只能存在一個相同彈窗 */
  only?: boolean
  /** 動畫效果
   * - bounce: 彈跳
   * - bottom: 從底部彈起
   * - boom: 爆炸效果
   */
  anime?: 'bounce' | 'bottom',
  /** 透明度 */
  opacity?: number
  /** 層級 */
  zIndex?: number,
  /** 點擊遮罩關閉 */
  maskClose?: boolean
}

/** 所有彈窗組件 */
// type PopupComponent = PopupComponent
/** 所有彈窗组件名稱 */
type PopupNames = keyof PopupComponent

/** 获取vue组件参数 */
type CompoentParams<Name extends string> = Name extends keyof PopupComponent ? PopupComponent[Name] extends DefineComponent<
infer P,
infer B,
infer D,
infer C extends ComputedOptions,
infer M extends MethodOptions,
infer Mixin,
infer Extends,
infer E extends EmitsOptions,
infer PublicProps,
infer Defaults
> ? {
P: P
B: B
D: D
C: C
M: M
Mixin: Mixin
Extends: Extends
E: E
PublicProps: PublicProps
Defaults: Defaults
} : never : never;


/** 解析字符串参数 */
type SplitParams <Str extends string> = Str extends `${ infer Name }?${ infer Params }` ? [Name, FormatParams<Params>] : [Str, any];
type FormatParams <Str extends string> = Str extends `${ infer Param1 }&${ infer Param2 }` ? ForamtValue<Param1> & FormatParams<Param2> : ForamtValue<Str>;
type ForamtValue <Str extends string> = Str extends `${ infer Name }=${ infer Value }` ? {[T in Name]:Value} : {[T in Str]: true};
/** 获取组件名字 */
type FormatName<Name extends string> = SplitParams<Name>[0] extends PopupNames ? SplitParams<Name>[0] : never;

/** 获取参数 */
type GetObjectParams<T, K, D = never> = K extends keyof T ? Pick<T, K>[K] : D;
type GetFunctionParams<T, K = never, D = never> = T extends (...args: any[]) => any ? K extends number ? Parameters<T>[0] : Parameters<T> : D;

/** 获取组件props */
type Props<Name extends string> = SplitParams<Name>[0] extends PopupNames ? (`$props` extends keyof CompoentParams<SplitParams<Name>[0]>['B'] ? {
  -readonly [T in keyof GetObjectParams<CompoentParams<SplitParams<Name>[0]>['B'], '$props'>]?: GetObjectParams<CompoentParams<SplitParams<Name>[0]>['B'], T>
} : {
  [T in keyof CompoentParams<SplitParams<Name>[0]>['P']]?: GetObjectParams<CompoentParams<SplitParams<Name>[0]>['P'][T], 'type'> extends PropType<infer Type> ? Type : GetObjectParams<CompoentParams<SplitParams<Name>[0]>['P'][T], 'default'>
}) : Record<string, any>;

/** 关闭窗口emit事件 */
type DefaultEmitEvent = {
  close: (cb: () => void, ...args: any[]) => void
}
/** 获取组件emit */
type Emits<Name extends string> =  SplitParams<Name>[0] extends PopupNames ?  (`$emit` extends keyof CompoentParams<SplitParams<Name>[0]>['B'] ? {
  [K in GetFunctionParams<CompoentParams<SplitParams<Name>[0]>['B']['$emit'], 0>]: GetObjectParams<CompoentParams<SplitParams<Name>[0]>['B'], '$emit', never>
} : {
  [K in keyof CompoentParams<SplitParams<Name>[0]>['E']]: CompoentParams<SplitParams<Name>[0]>['E'][K]
}) : never;

type ReturnPopupObject = InstanceType<typeof PopupObject>

/** 创建弹窗对象 */
class PopupObject<Id extends number, Name extends PopupNames> {
  /** 簡單合併兩個對象 */
  static deepMerge<T extends Record<string, any>, T1 extends Record<string, any>>(target: T, source: T1):T {
    for (const key in source) {
        if (source[key as string] instanceof Object) {
            if (!target[key as string]) Object.assign(target, { [key]: {} });
            PopupObject.deepMerge(target[key as string], source[key as string]);
        } else {
            Object.assign(target, { [key]: source[key] });
        }
    }
    return target;
  }
  /** 彈窗id */
  id:Id
  /** 弹窗名称 */
  name:Name
  /** 弹窗数据 */
  data: Props<Name>
  /** 彈窗組件 */
  ref: InstanceType<PopupComponent[Name]>
  /** 配置 */
  option: PopupConfig = {
    maskClose: false, // 點擊遮罩關閉
    only: false, // 只能存在一個
    opacity: undefined, // 透明度
    zIndex: undefined, // 層級
    anime: 'bounce', // 動畫
  }
  /** 窗口控制方法掛載 */
  private closeCtrlFn = (...args:any[]):void => (undefined)
  /** 事件列表 **/
  event:Record<string, (...args:any[]) => void> = {
    close: (cb: () => void, ...args: any[]):void => undefined
  };

  constructor(id: Id, name: Name, data: Props<Name>, option: PopupConfig) {
    this.id = id;
    this.name = name;
    this.option = PopupObject.deepMerge(this.option, option || {});
    this.data = data; // 弹窗数据
  }
  /**
   * 註冊監聽$emit事件, 觸發在組件上使用$emit('事件名')觸發事件, 多個相同名稱事件會覆蓋
   * @param event 事件名
   * @param callback 事件回調
   * @returns { PopupObject } 彈窗對象
   */
  on <EventType extends string>(event: keyof DefaultEmitEvent | keyof Emits<Name> | EventType, callback: GetObjectParams<DefaultEmitEvent, EventType, GetObjectParams<Emits<Name>, EventType, (...args:any[]) => void>>) { // 添加事件
    if (event === 'close') {
      // 將窗口關閉方法作為參數傳入
      this.event[event as string] = (callback as () => void).bind(this, this.closeCtrlFn)
    } else if (event) {
      this.event[event as string] = callback as () => void;
    }
    return this;
  }
  /**
   * 獲取組件實例
   * @param el 組件
   * @returns this
   */
  onRef = (el: InstanceType<PopupComponent[Name]>) => {
    this.ref = el;
    return this
  }
  /** 手動關閉窗口 */
  close = () =>  {
    this.event['close']?.call(this, this.id)
  }
  /** 掛載窗口關閉控制 */
  addCtrl = (fn: () => void) =>  {
    this.closeCtrlFn = fn
  }
}



type ToastConfig = {
    /** 持續時間 */
  duration?: number
}
/** toast */
class ToastObject {
  id: number
  /** 显示文本 */
  text = ''
  /** 配置 */
  option:ToastConfig = {
    /** 持續時間 */
    duration: 3000
  }
  timer:undefined|ReturnType<typeof setTimeout> = undefined
  /** 窗口控制方法掛載 */
  private closeCtrlFn = (...args:any[]):void => undefined
  constructor(id: number, text: string, option: ToastConfig|number = {}) {
    this.id = id;
    this.text = text;
    // 只傳入數字則為持續時間
    if (typeof option === 'number') {
      this.option = PopupObject.deepMerge(this.option, {duration: option})
    } else {
      this.option = PopupObject.deepMerge(this.option, option || {});
    }
  }
  /** 手動關閉窗口 */
  close = () =>  {
    clearTimeout(this.timer)
    this.closeCtrlFn(this.id)
  }
  /** 掛載窗口關閉控制 */
  addCtrl = (fn: () => void) =>  {
    this.closeCtrlFn = fn
  }
  /** 开始计时 */
  start () {
    // 固定時長後自動關閉
    this.timer = setTimeout(() => {
      this.close();
    }, this.option.duration);
  }
}

const usePopupStore = defineStore('PopupStore', () => {

  const popupIndex = ref(1);
  const popupList: ReturnPopupObject[] = reactive([]);
  const toastList: Array<ToastObject> = reactive([]);

  /**
   * 創建彈窗對象
   * @param popupName 彈窗名, 需要對應組件名
   * @param popupData 彈窗數據, 在組件中使用props獲取
   * @param popupConfig 彈窗配置
   * @returns 彈窗對象
   */
  function createPopup <Name extends string>(popupName: Name | PopupNames, popupData?: Props<Name>, popupConfig: PopupConfig = {}, show = true):PopupObject<number, FormatName<Name>> {
    // if (!popupName) return '';
    const popupId = popupIndex.value++;
    const query:SplitParams<typeof popupName>[1] = {};
    let name:SplitParams<typeof popupName>[0] = popupName
    // 彈窗名後面拼參數
    if (name.indexOf('?') > -1) {
      let search = '';
      [name, search] = String(popupName).split('?');
      search.split('&').forEach(item => {
        const [key, value] = item.split('=');
        query[key] = value || true;
      })
    }
    // 配置了只能存在一個同名彈窗
    if (popupConfig?.only) {
      const [popup] = popupList.filter((popup) => popup.name === name)
      if (popup) {
        return popup as PopupObject<number, FormatName<Name>>;
      }
    }
    // 創建窗口對象
    const popupObject = new PopupObject(popupId, name as PopupNames, PopupObject.deepMerge(popupData, query), popupConfig);
    // 掛載窗口控制方法
    popupObject.addCtrl(close.bind(this, popupObject.id));
    // 默認關閉窗口事件
    popupObject.on('close', () => {
      close(popupObject.id);
    });
    
    show && popupList.push(popupObject)
    return popupObject
  }


  /**
   * 打開彈窗
   * @param popupName 彈窗組件名
   * @param popupData 數據, 組件內使用defineProps獲取
   * @param popupConfig 配置
   * @returns {PopupObject} 彈窗對象
   */
  function open <Name extends string>(popupName: Name | PopupNames, popupData?: Props<Name>, popupConfig: PopupConfig = {}):PopupObject<number, FormatName<Name>> {
    return createPopup(popupName, popupData, popupConfig)
  }
  // function open <Name extends PopupNames>(popupName: Name, popupData?: Props<Name> , popupConfig: PopupConfig = {}, show = true):PopupObject<number, Name> {
  //   return createPopup(popupName, popupData, popupConfig, show)
  // }

  /** 只能存在一個 */
  function only <Name extends string>(popupName:  Name | PopupNames, popupData?: Props<Name>, popupConfig: PopupConfig = {}):PopupObject<number, FormatName<Name>> {
    return createPopup(popupName, popupData, PopupObject.deepMerge(popupConfig, {only: true}))
  }
  
  /**
   * 每日彈窗彈一次, 使用$emit('close', true)控制是否再能再次觸發
   * @param popupName 彈窗組件名
   * @param popupData 數據, 組件內使用defineProps獲取
   * @param popupConfig 配置
   * @returns {PopupObject} 彈窗對象
   */
  function daily <Name extends string>(popupName: Name | PopupNames, popupData?: Props<Name>, popupConfig: PopupConfig = {}):PopupObject<number, FormatName<Name>> {
    const storeName = `${actName}_${popupName}_daily_open_time`;
    const prevDayTime = localStorage.getItem(storeName) || 0;
    const curDayTime = (new Date()).setHours(0,0,0,0);
    // 超過今天0點
    return createPopup(popupName, popupData, popupConfig, curDayTime > Number(prevDayTime)).on('close', (cb, val) => {
      if (val) {
        localStorage.removeItem(storeName);
      } else {
        localStorage.setItem(storeName, curDayTime.toString());
      }
      cb();
    });
  }


  /**
   * 活動只彈一次, 使用$emit('close', true)控制是否再能再次觸發, 如果需要id區分將id拼在彈窗名字後面裡 popupName?id=111
   * @param popupName 彈窗組件名
   * @param popupData 數據, 組件內使用defineProps獲取
   * @param popupConfig 配置
   * @returns {PopupObject} 彈窗對象
   */
  function once <Name extends string>(popupName: Name | PopupNames, popupData?: Props<Name>, popupConfig: PopupConfig = {}):PopupObject<number, FormatName<Name>> {
    const storeName = `${actName}_${popupName}_once`;
    const storeVal = localStorage.getItem(storeName);
    // 超過今天0點
    // localStorage.setItem(storeName, '1');
    return createPopup(popupName, popupData, popupConfig, !Boolean(Number(storeVal))).on('close', (cb, val) => {
      if (val) {
        localStorage.removeItem(storeName)
      } else {
        localStorage.setItem(storeName, '1')
      }
      cb()
    })
  }


  /** 從底部彈起 */
  function bottom <Name extends string>(popupName: Name | PopupNames, popupData?: Props<Name>, popupConfig: PopupConfig = {}):PopupObject<number, FormatName<Name>> {
    return createPopup(popupName, popupData, Object.assign(popupConfig, {anime: 'bottom'}))
  }

  /** 關閉彈窗 */
  function close (id = -1):ReturnPopupObject|null {
    let popup:ReturnPopupObject = null;
    // 沒有傳id關閉最後一個
    if (id === -1) {
      [popup] = popupList.splice(-1, 1)
    } else {
      const index = popupList.findIndex((popup) => popup.id === id);
      if (index > -1) {
        [popup] = popupList.splice(index, 1)
      }
    }
    return popup;
  }

  /**
   * toast
   * @param text 文本
   * @param config 配置 時長
   */
  function toast (text: string, config:ToastConfig|number = null):ToastObject {
    const toastId = popupIndex.value++;
    const toastObject = new ToastObject(toastId, text, config);
    toastObject.addCtrl(() => {
      const index = toastList.findIndex((toastObj) => toastObj.id === toastId);
      if (index > -1) {
        return toastList.splice(index, 1)
      }
    });
    toastList.push(toastObject);
    toastObject.start();
    return toastObject
  }

  return {
    popupId: popupIndex,
    popupList,
    toastList,
    createPopup,
    open,
    only,
    daily,
    once,
    bottom,
    close,
    toast
  }
})

export default usePopupStore
