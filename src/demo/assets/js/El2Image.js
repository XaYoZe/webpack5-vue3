// 使用
// this.el2Image = new El2Image();
// await this.el2Image.draw({el: this.$refs.source });  
export default class El2Image {
  // 文案片段
  frag = document.createDocumentFragment();
  // 請求緩存
  cache = {};
  svgEl = null;
  canvasEl = null;
  // 加important的屬性, 部分屬性錯亂是可以加上試試
  importantList = [
    // 'background-size' // 解決ios多張背景不同尺寸顯示問題
  ];
  skipStyleList = [ // 跳過樣式
    '-webkit-background-size' // ios 該樣式會導致多張背景圖片出現尺寸錯亂
  ];
  loadImageList = []; // 圖片加載列表
  defaultStyleMap = {}; //  默認元素樣式
  supportComputedStyleMap = Boolean(document.body.computedStyleMap); // 是否支持computedStyleMap方法
  constructor() {
    this.initDefaultStyle();
  }
  // 初始化默認樣式
  initDefaultStyle() {
    let iframe = document.createElement("iframe");
    let tagList = ["h1", "h2", "div", "span", "p", "ul", "li", "input", "img", "a", "button", "canvas"];
    let pseudoElList = ['::before', '::after'];
    iframe.style.display = "none";
    iframe.onload = (e) => {
      let contentDocument = iframe.contentDocument;
      tagList.forEach((item) => {
        let dom = contentDocument.createElement(item);
        contentDocument.body.append(dom);
        if (this.supportComputedStyleMap) {
          this.defaultStyleMap[dom.tagName] = dom.computedStyleMap();
          return;
        }
        this.defaultStyleMap[dom.tagName] = window.getComputedStyle(dom);
      });
      pseudoElList.forEach((item) => {
        this.defaultStyleMap[item] = window.getComputedStyle(contentDocument.body, item);
      })
    };
    document.body.append(iframe);
  }
  // uint8Array 转bese64
  bufferToBase64(array) {
    let base64 = "";
    array.forEach((item) => {
      base64 += String.fromCharCode(item);
    });
    return window.btoa(base64);
  }
  // 获取图片转成base64
  getPicBase64(src) {
    if (this.cache[src]) {
      return Promise.resolve(this.cache[src]);
    }
    let mineType = "";
    return fetch(src)
      .then(async (res) => {
        let blob = await res.blob();
        mineType = blob.type;
        return new Uint8Array(await blob.arrayBuffer());
      })
      .then((res) => {
        let base64 = `data:${mineType};base64,` + this.bufferToBase64(res);
        this.cache[src] = base64;
        return base64;
      })
      .catch((err) => {
        console.log("获取图片错误");
        return Promise.reject(err);
      });
  }
  /**
   * 偽元素樣式
   * @param {*} el 要檢測偽元素的元素
   * @param {*} tag 添加偽元素樣式的元素
   * @returns 偽元素樣式文本
   */
  async hasPseudoElement(el, tag) {
    // before偽元素
    let beforeStyle = window.getComputedStyle(el, "before");
    // after偽元素
    let afterStyle = window.getComputedStyle(el, "after");
    if (beforeStyle.content == "none" && beforeStyle.content == "none") {
      return "";
    }
    let beforeStyleText = "";
    let afterStyleText = "";
    let selector = this.createSelector(tag);
      // ::before 偽元素
    if (beforeStyle.content !== "none") {
      beforeStyleText = `${selector}::before { ${await this.createStyle(beforeStyle, '::before')} }`;
    }
      // ::after 偽元素
    if (afterStyle.content !== "none") {
      afterStyleText = `${selector}::after { ${await this.createStyle(afterStyle, '::after')} }`;
    }
    return `${beforeStyleText}${afterStyleText}`;
  }
  /**
   * 遞歸复制节点
   * @param {document} targetEl 克隆的目標
   * @param {document} container 容器元素
   * @param {string} layer 樣式
   */
  async compile(targetEl, container, layer = "1") {
    // 元素節點
    if (targetEl.nodeType == 1) {
      let cloneEl = targetEl.cloneNode();
      // 額外處理一些元素節點
      switch (targetEl.tagName) {
        case "IMG": // 處理圖片標籤
          try {
            cloneEl.src = await this.getPicBase64(targetEl.src);
            this.loadImageList.push(cloneEl.src);
          } catch (err) {
            cloneEl.removeAttribute("src");
          }
          break;
        case "CANVAS": // 處理canvas標籤
          cloneEl = document.createElement("img");
          Array.from(targetEl.attributes, (item) => {
            cloneEl.setAttribute(item.name, item.value);
          });
          try {
            cloneEl.src = targetEl.toDataURL("image/png");
            this.loadImageList.push(cloneEl.src);
          } catch (err) {
            cloneEl.removeAttribute("src");
            console.log("圖片轉換錯誤", err);
          }
          break;
        case "video":
          cloneEl = document.createElement("img");
          Array.from(targetEl.attributes, (item) => {
            cloneEl.setAttribute(item.name, item.value);
            cloneEl.innerHTML = targetEl.value;
          });
          try {
            cloneEl.src = this.createCanvas(node);
            this.loadImageList.push(cloneEl.src);
          } catch (err) {
            cloneEl.removeAttribute("src");
            console.log("視頻轉換錯誤", err);
          }
          break;
        case "INPUT": // 處理input text 標籤
          if (targetEl.getAttribute("type") === "text") {
            cloneEl = document.createElement("div");
            Array.from(targetEl.attributes, (item) => {
              cloneEl.setAttribute(item.name, item.value);
              cloneEl.innerHTML = targetEl.value;
            });
          }
          break;
        default:
          break;
      }
      cloneEl.classList.add(`layer-${layer}`);
      let style = this.supportComputedStyleMap ? targetEl.computedStyleMap() : window.getComputedStyle(targetEl);
      let styleTag = document.createElement("style");
      let styleText = await this.hasPseudoElement(targetEl, cloneEl);
      styleTag.innerHTML = styleText + `${await this.createElStyle(style, cloneEl)}`;
      container.appendChild(cloneEl);
      container.append(styleTag);
      if (targetEl.childNodes.length > 0) {
        for (let i = 0; i < targetEl.childNodes.length; i++) {
          await this.compile(targetEl.childNodes[i], cloneEl, `${layer}-${i + 1}`);
        }
      }
    }
    // 文本節點
    if (targetEl.nodeType == 3) {
      container.append(document.createTextNode(targetEl.nodeValue));
    }
  }
  /**
   * 用元素樣式名創建選擇器
   * @param {*} el 創建選擇器的元素
   * @returns 樣式選擇器
   */
  createSelector(el) {
    let className = "";
    let tagName = `${el.tagName.toLocaleLowerCase()}`;
    el.classList.forEach((item) => {
      className += "." + item;
    });
    return tagName + className;
  }
  /**
   * 通過window.getComputedStyle創建樣式
   * @param {*} computedStyle 元素的樣式表, 通過windw.getConputedStyle獲得
   * @param {*} target 要賦予樣式的目標選擇器或者元素
   * @returns 樣式字符串
   */
  async createStyle(computedStyle, target) {
    let styleStr = "";
    let count = 0;
    let styleName = "";
    let styleText = "";
    // 判斷是不是偽元素
    let isElement = typeof target === 'object';
    let tagName =  isElement ? target.tagName : target;
    while ((styleName = computedStyle.item(count))) {
      count++;
      styleText = computedStyle.getPropertyValue(styleName);
      if (target && styleText === this.defaultStyleMap[tagName]?.getPropertyValue(styleName) || this.skipStyleList.includes(styleName)) continue;
      if (/url\(.*\)/.test(styleText) && !/url\(data:.*\)/.test(styleText)) {
        styleText = await this.replaceBgImg(styleText);
      }
      if (this.importantList.includes(styleName)) {
        styleText += '!important';
      }
      styleStr += `${styleName}: ${styleText};`;
    }
    return isElement ? `${this.createSelector(target)}{${styleStr}}`: styleStr;
  }
  /**
   * 通過el.computedStyleMap創建樣式
   * @param {*} styleMap 通過el.computedStyleMap的樣式
   * @param {*} el 賦予樣式的元素
   * @returns 樣式字符串
   */
  async createElStyle (styleMap, el) {
    if (this.supportComputedStyleMap) {
      return new Promise(resolve => {
        let cssText = '';
        let imgCount = 0;
        let imgTotalCount = 0;
        styleMap.forEach(async (cssVal, cssKey) => {
          if (this.defaultStyleMap[el.tagName]?.get(cssKey)?.toString() !== cssVal.toString()) {
            let styleText = cssVal.toString();
            if (/url\(.*\)/.test(styleText) && !/url\(data:.*\)/.test(styleText)) {
              imgTotalCount++;
              styleText = await this.replaceBgImg(styleText);
              imgCount++;
            }
            cssText += `${cssKey}: ${styleText};`;
          }
          if (imgTotalCount > 0 && imgTotalCount === imgCount) {
            resolve( el ? `${this.createSelector(el)}{${cssText}}` : cssText);
          }
        });
        if (!imgTotalCount) {
          resolve( el ? `${this.createSelector(el)}{${cssText}}` : cssText);
        }
      })
    }
    return this.createStyle(styleMap, el)
  }
  // styleText: 樣式值
  /**
   * 將背景圖片url替換base64
   * @param {*} styleText 帶url的樣式
   * @returns 替換後的樣式
   */
  async replaceBgImg (styleText) {
    let urlReg = /url\(["'](.*?)['"]\)/g;
    let newStyle = styleText;
    let urlExec = "";
    while ((urlExec = urlReg.exec(styleText))) {
      try {
        let url = urlExec[1];
        let src = await this.getPicBase64(url);
        this.loadImageList.push(src);
        // await this.createImage(res)
        newStyle = newStyle.replace(url, src);
      } catch (err) {}
    }
    return newStyle
  }
  /**
   * 生成svga鏈接
   * @returns svga鏈接
   */
  createSvg() {
    // 生成svg
    let svgXml = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    svgXml.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgXml.appendChild(foreignObject);
    svgXml.setAttribute("width", this.imgWidth);
    svgXml.setAttribute("height", this.imgHeight);
    foreignObject.setAttribute("width", this.imgWidth);
    foreignObject.setAttribute("height", this.imgHeight);
    foreignObject.append(this.frag);
    this.svgEl = svgXml;
    // 格式化
    var serializer = new XMLSerializer();
    return "data:image/svg+xml;charset=utf-8," +  encodeURIComponent('<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svgXml));
  }
  /**
   * 創建圖片,並等待加載完成
   * @param {url} src 圖片鏈接
   * @returns 圖片元素
   */
  createImage(src) {
    return new Promise((res, rej) => {
      var image = new Image();
      image.src = src;
      image.onload = () => {
        res(image);
      };
      image.onerror = rej;
    });
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
    var canvas = cvs || document.createElement("canvas"); //准备空画布
    canvas.width = (image.width  || image.offsetWidth) * window.devicePixelRatio;
    canvas.height =(image.height  || image.offsetHeight) * window.devicePixelRatio;
    canvas.style.width = `${image.width  || image.offsetWidth}px`;
    canvas.style.height = `${image.height  || image.offsetHeight}px`;
    var context = canvas.getContext("2d"); //取得画布的2d绘图上下文
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    console.log(image.width, image.height, canvas.width,canvas.height, devicePixelRatio);
    // document.body.append(canvas);
    this.canvasEl = canvas;
    return canvas.toDataURL("image/png", quality);
  }
  // 下載
  download (base64) {
      let a = document.createElement('a');
      a.href = base64;
      a.download = "download";
      a.click();
  }
  // 等待圖片加載結束
  awaitImgLoad () {
    let count = 0;
    let totalCount = this.loadImageList.length;
    return new Promise(resolve => {
      for (let i in this.loadImageList) {
        let img = new Image();
        img.src = this.loadImageList[i];
        img.onload = () => {
          console.log('加載圖片完成');
          count++;
          if (count === totalCount) {
            console.log('加載所有圖片文件完成');
            resolve();
          }
        }
        img.onerror = () => {
          console.log('加載圖片失敗');
          count++;
        }
      }
    })
  }
  /**
   * 渲染圖片
   * @param {Object} options {el: 要截圖的元素, quality: 輸出圖片質量, width: 輸出圖片寬度, height: 輸出圖片高度}
   * @returns base64格式png圖片
   */
  async draw (options) {
    this.options = options;
    this.el = options.el; // dom節點
    this.quality = options.quality || 1; // 成像質量
    this.imgWidth = options.width || this.el.offsetWidth; // 圖片寬度
    this.scale = 1; // 圖片縮放比例
    // 只傳寬度, 根據比例放大縮小
    if (!options.height && options.width) {
      this.scale = options.width / this.el.offsetWidth;
      this.imgHeight = this.scale * this.el.offsetHeight;
    } else {
      this.imgHeight = options.height || this.el.offsetHeight; // 圖片高度
    }
    await this.compile(this.el, this.frag);
    let svgSrc = await this.createSvg();
    let img = await this.createImage(svgSrc);
    this.loadImageList.push(svgSrc)
    // this.svgEl = svgSrc
    await this.awaitImgLoad();
    let canvasData = await this.createCanvas(img, this.quality);
    if (!this.supportComputedStyleMap) {
      // 延遲後重繪一遍, 解決ios圖片渲染不出來的問題
      await this.sleep(50);
      canvasData = this.createCanvas(img, this.quality, this.canvasEl);
    }
    return canvasData;
  }
  /**
   * 休眠
   * @param {number} time 時長
   * @returns Promise
   */
  sleep (time) {
    return new Promise(res => {
      setTimeout(() => {
        res()
      }, time);
    })
  }
}
