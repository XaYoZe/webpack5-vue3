// 使用
// this.el2Image = new El2Image({el: this.$refs.source });
// await this.el2Image.draw();  
export default class El2Image {
  // 文案片段
  frag = document.createDocumentFragment();
  // 請求緩存
  cache = {};
  // 加important的屬性, 部分屬性錯亂是可以加上試試
  importantList = [];
  defaultStyle = {};
  defaultStyleMap = {};
  /**
   * 
   * @param {*} options el: dom節點;width: 圖片寬度, height:圖片高度, quality:成像質量
   */
  constructor(options = {}) {
    this.el = options.el; // dom節點
    this.options = options;
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
    this.svgEl = null;
    this.canvasEl = null;
    this.defaultPseudoElStyle = {}; // 默認偽元素樣式
    this.defaultStyleMap = {}; // 默認元素樣式 
    this.loadImageList = []; // 圖片加載列表
    // this.importantList = ['background-size']; // 添加impportant的樣式
    this.supportComputedStyleMap = Boolean(document.body.computedStyleMap); // 是否支持computedStyleMap方法
    this.initDefaultStyle();
  }
  // 初始化默認樣式
  initDefaultStyle() {
    let iframe = document.createElement("iframe");
    let srcdoc = "";
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
        this.defaultStyleMap[dom.tagName] = window.getComputedStyle(contentDocument.body, item);
      });
      pseudoElList.forEach((item) => {
        this.defaultPseudoElStyle[item] = window.getComputedStyle(contentDocument.body, item);
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
  getPic(src) {
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
  // 檢測偽元素
  async hasPseudoElement(node, tag) {
    let beforeStyle = window.getComputedStyle(node, "before");
    let afterStyle = window.getComputedStyle(node, "after");
    if (beforeStyle.content == "none" && beforeStyle.content == "none")
      return "";
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
  // 遞歸复制节点
  // node: 複製的目標
  // conf: 添加的目標
  // layer: 層級
  async compile(node, conf, layer = "1") {
    // 元素節點
    if (node.nodeType == 1) {
      let tag = node.cloneNode();
      switch (node.tagName) {
        case "IMG": // 處理圖片標籤
          try {
            tag.src = await this.getPic(node.src);
            this.loadImageList.push(tag.src);
          } catch (err) {
            tag.removeAttribute("src");
          }
          break;
        case "CANVAS": // 處理canvas標籤
          tag = document.createElement("img");
          Array.from(node.attributes, (item) => {
            tag.setAttribute(item.name, item.value);
          });
          try {
            tag.src = node.toDataURL("image/png");
            this.loadImageList.push(tag.src);
          } catch (err) {
            tag.removeAttribute("src");
            console.log("圖片轉換錯誤", err);
          }
          break;
        case "video":
          let canvas = this.createCanvas(node);
          tag = document.createElement("img");
          Array.from(node.attributes, (item) => {
            tag.setAttribute(item.name, item.value);
            tag.innerHTML = node.value;
          });
          try {
            tag.src = canvas.toDataURL("image/png");
            this.loadImageList.push(tag.src);
          } catch (err) {
            tag.removeAttribute("src");
            console.log("視頻轉換錯誤", err);
          }
          break;
        case "INPUT": // 處理input text 標籤
          if (node.getAttribute("type") === "text") {
            tag = document.createElement("div");
            Array.from(node.attributes, (item) => {
              tag.setAttribute(item.name, item.value);
              tag.innerHTML = node.value;
            });
          }
          break;
        default:
          break;
      }
      tag.classList.add(`layer-${layer}`);
      // tag.className = `layer-${layer}`;
      let style = this.supportComputedStyleMap ? node.computedStyleMap() : window.getComputedStyle(node);
      let styleTag = document.createElement("style");
      let styleText = await this.hasPseudoElement(node, tag);
      styleTag.innerHTML = styleText + `${await this.createElStyle(style, tag)}`;
      conf.appendChild(tag);
      conf.append(styleTag);
      if (node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          await this.compile(node.childNodes[i], tag, `${layer}-${i + 1}`);
        }
      }
    }
    // 文本節點
    if (node.nodeType == 3) {
      conf.append(document.createTextNode(node.nodeValue));
    }
  }
  // 創建選擇器
  createSelector(el) {
    let className = "";
    let tagName = `${el.tagName.toLocaleLowerCase()}`;
    el.classList.forEach((item) => {
      className += "." + item;
    });
    return tagName + className;
  }
  // 創建樣式
  async createStyle(computedStyle, target) {
    let styleStr = "";
    let count = 0;
    let styleName = "";
    let styleText = "";
    let isElement = typeof target === 'object';
    let list = this[isElement ? 'defaultStyleMap' :'defaultPseudoElStyle'];
    let tagName =  isElement ? target.tagName : target;
    while ((styleName = computedStyle.item(count))) {
      count++;
      styleText = computedStyle.getPropertyValue(styleName);
      if (target && styleText === list[tagName]?.getPropertyValue(styleName)) continue;
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
  // 生成元素科樣式
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
    console.log('不支持computedStyleMap');
    return this.createStyle(styleMap, el)
  }
  // 替換背景圖片
  // styleText: 樣式值
  async replaceBgImg (styleText) {
    let urlReg = /url\(["'](.*?)['"]\)/g;
    let newStyle = styleText;
    let urlExec = "";
    while ((urlExec = urlReg.exec(styleText))) {
      try {
        let url = urlExec[1];
        let src = await this.getPic(url);
        this.loadImageList.push(src);
        // await this.createImage(res)
        newStyle = newStyle.replace(url, src);
      } catch (err) {}
    }
    return newStyle
  }
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
  // 生成cavas
  async createCanvas(image, width, height, quality = 1) {
    var canvas = document.createElement("canvas"); //准备空画布
    canvas.width = (width || image.offsetWidth) * window.devicePixelRatio;
    canvas.height =(height || image.offsetWidth) * window.devicePixelRatio;
    canvas.style.width = `${width || image.offsetWidth}px`;
    canvas.style.height = `${height || image.offsetWidth}px`;
    var context = canvas.getContext("2d"); //取得画布的2d绘图上下文
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
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
          count++;
        }
      }
    })
  }
  // 渲染圖片
  async draw () {
    await this.compile(this.el, this.frag);
    // console.log('背景圖片列表', this.loadImageList);
    let svgSrc = await this.createSvg();
    let img = await this.createImage(svgSrc);
    this.loadImageList.push(svgSrc)
    await this.awaitImgLoad();
    let canvasData = await this.createCanvas(img, this.imgWidth, this.imgHeight, this.quality);
    // this.download(canvasData);
    return canvasData;
  }
}
