// 使用
// this.el2Image = new el2img();
// await this.el2Image.draw({el: this.$refs.source });
export default class el2img {
  // 文案片段
  frag = document.createDocumentFragment()
  // 請求緩存
  cache = {}
  svgEl = null
  canvasEl = null
  base64Reg = /^data\:.*?;base64,/
  // 加important的屬性, 部分屬性錯亂是可以加上試試
  importantList = []
  skipStyleList = [
    // 跳過樣式
    '-webkit-background-size', // ios 該樣式會導致多張背景圖片出現尺寸錯亂
    'animation'
  ]
  elementList = ['h1', 'h2', 'div', 'span', 'p', 'ul', 'input', 'li', 'img', 'a', 'button', 'canvas']
  inputType = ['checkbox', 'audio', 'text', 'date']
  pseudoElementList = ['::before', '::after']
  loadImageList = [] // 圖片加載列表
  defaultStyleMap = {}; //  默認元素樣式
  useFonts = new Set();
  pageFontsCache = {};
  pageFontsLoaded = false;
  supportComputedStyleMap = Boolean(document.body.computedStyleMap) // 是否支持computedStyleMap方法
  constructor() {
    this.initDefaultStyle()
    this.getPageFonts();
  }
  // 初始化默認樣式, 用於減小svg體積
  initDefaultStyle() {
    let iframe = document.querySelector('#el2ImgDefaultStyle') || document.createElement('iframe');
    iframe.id = 'el2ImgDefaultStyle';
    iframe.style.display = 'none'
    iframe.onload = (e) => {
      let contentDocument = iframe.contentDocument;
      this.elementList.forEach((item) => {
        if (item === 'input') {
          this.inputType.forEach(inputType => {
            let dom = contentDocument.createElement('input');
            dom.type = inputType;
            contentDocument.body.append(dom)
            this.defaultStyleMap[dom.tagName + dom.type] = this.supportComputedStyleMap ? dom.computedStyleMap() : window.getComputedStyle(dom);
          })
          return
        }
        let dom = contentDocument.createElement(item)
        contentDocument.body.append(dom)
        this.defaultStyleMap[dom.tagName] = this.supportComputedStyleMap ? dom.computedStyleMap() : window.getComputedStyle(dom);
      })
      this.pseudoElementList.forEach((item) => {
        this.defaultStyleMap[item] = window.getComputedStyle(contentDocument.body, item)
      })
    }
    document.body.append(iframe)
  }
  // 获取字体
  async getPageFonts () {
    if (!this.pageFontsLoaded) {
      let sheets = document.styleSheets;
      for (let i = 0; i < sheets.length; i++) {
        for (let y = 0; y < sheets.item(i).cssRules.length; y++) {
          let cssRules = sheets.item(i).cssRules.item(y);
          if (cssRules[Symbol.toStringTag] === 'CSSFontFaceRule' && !this.pageFontsCache[cssRules.style.fontFamily]) {
            this.pageFontsCache[cssRules.style.fontFamily] = cssRules.cssText;;
            if (this.notBase64Url(cssRules.cssText)) {
              this.pageFontsCache[cssRules.style.fontFamily] = await this.replaceUrl(cssRules.cssText);
            }
          }
        }
      }
      this.pageFontsLoaded = true;
    }
  }
  /**
   * 判斷文本是否含非base64的url
   * @param {*} text 
   * @returns { Boolean } 是否含有鏈接
   */
  notBase64Url (text) {
    return /url\((?!['"]?data:.*?;base64,)/.test(text)
  }
  /**
   * 获取图片转成base64
   * @param { String } src 鏈接
   * @returns { String } base64數據
   */
  getPicBase64(src) {
    if (this.base64Reg.test(src)) {
      return Promise.resolve(src)
    }
    if (this.cache[src]) {
      return Promise.resolve(this.cache[src])
    }
    // ,{mode: 'cors', cache: 'reload'}
    return fetch(src).then(async res => {
      let base64 = await this.blobToBase64(await res.blob());
      this.cache[src] = base64;
      return  Promise.resolve(base64)
    }).catch(err => {
      return Promise.reject(err)
    })
  }
  // blob轉base64
  blobToBase64 (blob) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      let callback = (event) => {
        (event.type === 'load' ? resolve : reject)(reader.result);
        reader.removeEventListener('load', callback, true);
        reader.removeEventListener('error', callback, true);
        reader = undefined;
        callback = undefined;
      };
      reader.addEventListener('load', callback, true);
      reader.addEventListener('error', callback, true);
      reader.readAsDataURL(blob);
    })
  }
  /**
   * 遞歸复制节点
   * @param {HTMLElement} srcEl 被克隆元素
   * @param {HTMLElement} container 容器元素
   * @param {string} className 樣式名
   * @param {HTMLElement} styleEl 樣式元素
   * @param {Boolean} isRoot 是否根目錄
   */
  async cloneElement(srcEl, container, className = 'clone',  styleEl = document.createElement('style'), isRoot = true) {
    if (isRoot) {
      container.append(styleEl);
    }
    // 元素節點
    if (srcEl.nodeType == 1) {
      let cloneEl = await this.translateElement(srcEl);
      cloneEl.removeAttribute('style');
      cloneEl.setAttribute('class', className);
      let style = this.supportComputedStyleMap ? srcEl.computedStyleMap() : window.getComputedStyle(srcEl)
      let elementStyle = await this.createElementStyle(style, cloneEl)
      let pseudoElementStyle = await this.pseudoElementStyle(srcEl, cloneEl);
      styleEl.append(`${ elementStyle }\n${ pseudoElementStyle }\n`);
      container.appendChild(cloneEl)
      if (srcEl.childNodes.length > 0) {
        for (let i = 0; i < srcEl.childNodes.length; i++) {
          await this.cloneElement(srcEl.childNodes[i], cloneEl, `${className}-${i + 1}`, styleEl, false)
        }
      }
    }
    // 文本節點
    if (srcEl.nodeType == 3) {
      container.append(document.createTextNode(srcEl.nodeValue))
    }
  }
  /**
   * 轉換元素
   * @param {*} srcEl 轉換元素
   * @returns 
   */
  async translateElement (srcEl) {
    let cloneEl = srcEl.cloneNode()
    // 額外處理一些元素節點
    switch (srcEl.tagName) {
      case 'IMG': // 處理圖片標籤
        try {
          cloneEl.src = await this.getPicBase64(srcEl.src)
        } catch (err) {
          console.log('圖片加載失敗', srcEl.src, err)
          cloneEl.removeAttribute('src')
        }
        break
      case 'CANVAS': // 處理canvas標籤
        cloneEl = document.createElement('img')
        Array.from(srcEl.attributes, (item) => {
          cloneEl.setAttribute(item.name, item.value)
        })
        try {
          cloneEl.src = srcEl.toDataURL('image/png')
        } catch (err) {
          cloneEl.removeAttribute('src')
          console.log('圖片轉換錯誤', err)
        }
        break
      case 'video':
        cloneEl = document.createElement('img')
        Array.from(srcEl.attributes, (item) => {
          cloneEl.setAttribute(item.name, item.value)
        })
        try {
          cloneEl.src = this.createCanvas(node)
        } catch (err) {
          cloneEl.removeAttribute('src')
          console.log('視頻轉換錯誤', err)
        }
        break
      case 'INPUT': // 處理input text 標籤
        switch (srcEl.getAttribute('type')) {
          case 'text':
          case 'date':
          case 'tel':
          case 'password':
          case 'number':
            cloneEl.setAttribute('value', srcEl.value)
            break;
          case 'checkbox':
          case 'radio':
              cloneEl.setAttribute('checked', srcEl.checked)
              break;
          default:
            break;
        }
        break
      default:
        break
    }
    return cloneEl;
  }
  /**
   * 通過window.getComputedStyle創建樣式
   * @param {StylePropertyMap|CSSStyleDeclaration} computedStyle 元素的樣式, 通過window.getComputedStyle或者element.computedStyleMap()獲得
   * @param {HTMLElement|String} target 要賦予樣式的目標選擇器或者元素
   * @param {String} pseudoElementName 偽元素名稱
   * @returns 樣式字符串
   */
  async createElementStyle(computedStyle, target, pseudoElementName = '') {
    let cssRuleDeclaration = '';
    let cssStyleProperty = '';
    let cssStyleValue = '';
    let tagName = pseudoElementName || target.tagName + (target.tagName === 'INPUT' ? target.type : '');
    let defaultStyle = this.defaultStyleMap[tagName];
    let selector = `.${ target.className }${ pseudoElementName }`;
    let useComputedStyleMap = this.supportComputedStyleMap && !pseudoElementName;
    let next = useComputedStyleMap ? null : 0;
    let useMethod = useComputedStyleMap ? 'getAll' : 'getPropertyValue';
    let entries = useComputedStyleMap ? computedStyle.keys() : null;
    while (cssStyleProperty = useComputedStyleMap ? (next = entries.next() , !next.done && next.value) : computedStyle.item(next++)) {
      cssStyleValue = computedStyle[useMethod](cssStyleProperty).toString();
      if (defaultStyle?.[useMethod](cssStyleProperty)?.toString() !== cssStyleValue && !this.skipStyleList.includes(cssStyleProperty)) {
        if (cssStyleProperty === 'font-family') {
          cssStyleValue.split(',').forEach(item => {
            this.useFonts.add(item.trim())
          })
        }
        if (this.notBase64Url(cssStyleValue)) {
          cssStyleValue = await this.replaceUrl(cssStyleValue)
        }
        cssRuleDeclaration += `${cssStyleProperty}: ${cssStyleValue};\n`
      }
    }
    return `${ selector } { ${cssRuleDeclaration} }`
  }
  /**
   * 偽元素樣式
   * @param {*} el 要檢測偽元素的元素
   * @param {*} tag 添加偽元素樣式的元素
   * @returns 偽元素樣式文本
   */
  async pseudoElementStyle(srcEl, el) {
    let cssText = '';
    for (let index in this.pseudoElementList) {
      let pseudoElementName = this.pseudoElementList[index];
      let style = window.getComputedStyle(srcEl, pseudoElementName);
      if (style.content == 'none') {
        continue
      }
      cssText += await this.createElementStyle(style, el, pseudoElementName)
    }
    return cssText
  }
  /**
   * 將url替換成base64
   * @param {*} styleText 帶url的樣式
   * @returns 替換後的樣式
   */
  async replaceUrl(styleText) {
    let urlReg = /url\(["'](.*?)['"]\)/g
    let newStyle = styleText
    let urlExec = ''
    while ((urlExec = urlReg.exec(styleText))) {
      let url = urlExec[1]
      try {
        let src = await this.getPicBase64(url)
        newStyle = newStyle.replace(url, src)
      } catch (err) {
        console.log('資源加載', url, err)
      }
    }
    return newStyle
  }
  addFonts (styleElement) {
    this.useFonts.forEach(font => {
      if (this.pageFontsCache[font]) {
        styleElement.insertBefore(new Text(this.pageFontsCache[font]), styleElement.firstChild)
      }
    })
  }
  /**
   * 生成svga鏈接
   * @returns svga鏈接
   */
  createSvg() {
    // 生成svg
    let svgXml = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
    svgXml.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svgXml.appendChild(foreignObject)
    svgXml.setAttribute('width', this.imgWidth)
    svgXml.setAttribute('height', this.imgHeight)
    foreignObject.setAttribute('width', this.imgWidth)
    foreignObject.setAttribute('height', this.imgHeight)
    foreignObject.append(this.frag)
    this.svgEl = svgXml
    // 格式化
    var serializer = new XMLSerializer()
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svgXml))
  }
  /**
   * 創建圖片,並等待加載完成
   * @param {url} src 圖片鏈接
   * @returns 圖片元素
   */
  createImage(src) {
    return new Promise((res, rej) => {
      var image = new Image()
      image.src = src
      image.onload = () => res(image)
      image.onerror = (err) => rej(err)
    })
  }
  //
  /**
   * 生成cavas
   * @param {*} image 圖片
   * @param {*} quality 圖片質量
   * @param {*} cvs 使用已有的canvas對象
   * @returns base64格式圖片
   */
  async createCanvas(image, quality = 1, cvs) {
    var canvas = cvs || document.createElement('canvas') //准备空画布
    canvas.width = (image.width || image.offsetWidth) * window.devicePixelRatio
    canvas.height = (image.height || image.offsetHeight) * window.devicePixelRatio
    canvas.style.width = `${image.width || image.offsetWidth}px`
    canvas.style.height = `${image.height || image.offsetHeight}px`
    var context = canvas.getContext('2d') //取得画布的2d绘图上下文
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    this.canvasEl = canvas
    return canvas.toDataURL('image/png', quality)
  }
  /**
   * 渲染圖片
   * @param {HTMLElement} el 要截圖的元素
   * @param {Object} options {quality: 輸出圖片質量, width: 輸出圖片寬度, height: 輸出圖片高度}
   * @returns base64格式png圖片
   */
  async draw(el, options) {
    this.el = el // dom節點
    this.options = options
    this.quality = options.quality || 1 // 成像質量
    this.imgWidth = options.width || this.el.offsetWidth // 圖片寬度
    this.scale = 1 // 圖片縮放比例
    // 只傳寬度, 根據比例放大縮小
    if (!options.height && options.width) {
      this.scale = options.width / this.el.offsetWidth
      this.imgHeight = this.scale * this.el.offsetHeight
    } else {
      this.imgHeight = options.height || this.el.offsetHeight // 圖片高度
    }
    let styleElement = document.createElement('style');
    await this.cloneElement(this.el, this.frag, 'clone', styleElement)
    this.frag.insertBefore(styleElement, this.frag.firstChild);
    this.addFonts(styleElement)
    let svgSrc = await this.createSvg();
    switch (options.type) {
      case 'svg':
        return svgSrc;
      case 'debug':
        return this.svgEl;
      default:
        let img = await this.createImage(svgSrc)
        if (!this.supportComputedStyleMap) {
          // 处理ios圖片渲染不出來的問題
          await this.sleep(50)
        }
        let canvasData = await this.createCanvas(img, this.quality, this.canvasEl)
        return canvasData
    }
  }
  /**
   * 休眠
   * @param {number} time 時長
   * @returns Promise
   */
  sleep(time) {
    return new Promise((res) => {
      setTimeout(() => {
        res()
      }, time)
    })
  }
}