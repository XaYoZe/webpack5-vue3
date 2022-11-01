export default class NodeCapture {
    // 文案片段
    frag = document.createDocumentFragment();
    // 圖片類型
    mineType = {
        png: "image/png",
        gif: "image/gif",
        svg: "image/svg+xml",
        jpeg: "image/jpeg"
    };
    // 請求緩存
    cache = {};
    // 加important的屬性, 部分屬性錯亂是可以加上試試

    importantList = ['backgroundSize'];
    //
    constructor(options = {}) {
        this.el = options.el;
        this.options = options;
    }
    // uint8Array 转bese64
    bufferToBase64(array) {
        let base64 = '';
        array.forEach(item => {
            base64 += String.fromCharCode(item);
        });
        return window.btoa(base64);
    }
    // 获取图片转成base64
    getPic(src) {
        if (this.cache[src]) {
            return Promise.resolve(this.cache[src]);
        }
        let mineType = '';
        return fetch(src).then(async res => {
            let blob = await res.blob();
            mineType = blob.type;
            return new Uint8Array(await blob.arrayBuffer());
        }).then(res => {
            let base64 = `data:${mineType};base64,` + this.bufferToBase64(res);
            this.cache[src] = base64;
            return base64
        }).catch(err => {
            console.log('获取图片错误');
        })
    }
    // init(el) {
    //     this.compile(el, this.frag).then(res => {
    //         this.createSvg();
    //     });
    // }
    // 創建選擇器
    createSelector(el) {
        let className = '';
        let tagName = `${el.tagName.toLocaleLowerCase()}`;
        el.classList.forEach(item => { className += '.' + item })
        return tagName + className
    }
    // 創建樣式
    async createStyle(computedStyle, el) {
        let styleStr = '';
        let count = 0;
        for (let key in computedStyle) {
            let style = computedStyle[key];
            if (!isNaN(key) || !style || typeof style === 'function') continue;
            let styleName = key.replace(/([A-Z])/g, '-$1').toLocaleLowerCase();
            /^webkit-/.test(styleName) && (styleName = '-' + styleName);
            if (isNaN(key) && style && typeof style === 'string') {
                count++;
                if (/url\(.*\)/.test(style) && !/url\(data:.*\)/.test(style)) {
                    let urlReg = /url\(["'](.*?)['"]\)/g;
                    let newStyle = style;
                    let urlExec = '';
                    while (urlExec = urlReg.exec(style)) {
                        let src = await this.getPic(urlExec[1]);
                        newStyle = newStyle.replace(urlExec[1], src);
                    }
                    style = newStyle;
                }
                if (this.importantList.includes(key)) {
                    style += '!important';
                }
                styleStr += `${styleName}: ${style};`
            }
        }
        if (el) {
            return `${this.createSelector(el)}{${styleStr}}`;
        }
        return styleStr
    }
    // 檢測偽元素
    async hasPseudoElement(node, tag) {
        let beforeStyle = window.getComputedStyle(node, 'before');
        let afterStyle = window.getComputedStyle(node, 'after');
        if (beforeStyle.content == "none" && beforeStyle.content == "none") return '';
        let beforeStyleText = '';
        let afterStyleText = '';
        let selector = this.createSelector(tag);
        if (beforeStyle.content !== "none") {
            beforeStyleText = `${selector}::before { ${await this.createStyle(beforeStyle)} }`;
        }
        if (afterStyle.content !== "none") {
            afterStyleText = `${selector}::after { ${await this.createStyle(afterStyle)} }`;
        }
        return `${beforeStyleText}${afterStyleText}`;
    }
    // 复制节点
    async compile(node, conf, layer = 1, index = 1) {
        // 節點
        if (node.nodeType == 1) {
            let tag = node.cloneNode();
            tag.classList.add(`flag-${layer}-${index}`);
            if (node.tagName === 'IMG') {
                tag.src = await this.getPic(node.src);
            }
            let style = window.getComputedStyle(node);
            let styleTag = document.createElement('style');
            let styleText = await this.hasPseudoElement(node, tag);
            styleTag.innerHTML = styleText + `${await this.createStyle(style, tag)}`;
            conf.appendChild(tag);
            conf.append(styleTag);
            if (node.childNodes.length > 0) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    await this.compile(node.childNodes[i], tag, layer + 1, i + 1);
                }
            }
        }
        if (node.nodeType == 3) {
            conf.append(document.createTextNode(node.nodeValue));
        }
    }
    createSvg () {
        this.width = this.options.width || this.el.offsetWidth;
        this.height = this.options.height || this.el.offsetHeight;
        // 生成svg
        let svgXml = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        svgXml.setAttribute('xmlns', "http://www.w3.org/2000/svg");
        svgXml.setAttribute('width', this.width);
        svgXml.setAttribute('height', this.height);
        foreignObject.setAttribute('width', this.width);
        foreignObject.setAttribute('height', this.height);
        svgXml.appendChild(foreignObject);
        foreignObject.append(this.frag);
        // 格式化
        var serializer = new XMLSerializer();
        return '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svgXml);
    }
    createImage (source) {
        return new Promise((res, rej) => {
            var image = new Image(this.width , this.height);
            image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            image.onload = () => { res(image) };
            image.onerror = rej;
        })
    }
    createCanvas (image) {
        var canvas = document.createElement('canvas');  //准备空画布
        canvas.width = this.width * window.devicePixelRatio;
        canvas.height = this.height * window.devicePixelRatio;
        var context = canvas.getContext('2d');  //取得画布的2d绘图上下文
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas;
    }
    // 下載
    download (canvas) {
        let a = document.createElement('a');
        a.href = canvas.toDataURL("image/png");
        a.download = "download";
        console.log(a.href);
        a.click();
    }
    async shot () {
        await this.compile(this.el, this.frag);
        console.log('截取完成');
        let svg = await this.createSvg();
        let img = await this.createImage(svg);
        let canvas = await this.createCanvas(img);
        this.download(canvas);
    }
}