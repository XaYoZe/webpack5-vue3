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

    importantList = [
        'borderSize'];
    defaultStyle = {};
    //
    constructor(options = {}) {
        this.el = options.el;
        this.options = options;
        this.initDefault();
    }
    initDefault () {
        let iframe = document.createElement('iframe');
        let srcdoc = '';
        let tagList = ['div', 'span', 'p', 'ul', 'li', 'input', 'img', 'a'];
        iframe.style.display = 'none';
        iframe.srcdoc = '';
        document.body.append(iframe);
        iframe.onload = (e) => {
            tagList.forEach(item => {
                let dom = iframe.contentDocument.createElement(item);
                iframe.contentDocument.body.append(dom);
                this.defaultStyle[dom.tagName] = window.getComputedStyle(dom);
            })
        }
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
            return Promise.reject(err);
        })
    }
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
        let styleName = '';
        let styleText = '';
        while (styleName = computedStyle.item(count)) {
            count++;
            styleText = computedStyle.getPropertyValue(styleName);
            if (el && styleText === this.defaultStyle[el.tagName]?.getPropertyValue(styleName)) continue;
            if (/url\(.*\)/.test(styleText) && !/url\(data:.*\)/.test(styleText)) {
                let urlReg = /url\(["'](.*?)['"]\)/g;
                let newStyle = styleText;
                let urlExec = '';
                while (urlExec = urlReg.exec(styleText)) {
                    try {
                        let src = await this.getPic(urlExec[1]);
                        newStyle = newStyle.replace(urlExec[1], src);
                    } catch (err) {

                    }
                }
                styleText = newStyle;
            }
            if (this.importantList.includes(styleName)) {
                styleText += '!important';
            }
            styleStr += `${styleName}: ${styleText};`
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
    async compile(node, conf, layer = '1') {
        console.log(node, node.nodeType);
        // 節點
        if (node.nodeType == 1) {
            let tag = node.cloneNode();
            switch (node.tagName) {
                case 'IMG': // 處理圖片標籤 
                    try {
                        tag.src = await this.getPic(node.src);
                    } catch (err) {
                        tag.removeAttribute('src');
                    }
                    break;
                case 'CANVAS': // 處理canvas標籤
                        tag = document.createElement('img');
                        Array.from(node.attributes, (item) => { 
                            tag.setAttribute(item.name, item.value);
                            tag.innerHTML = node.value;
                        })
                        try {
                            tag.src = canvas.toDataURL("image/png");
                        } catch (err) {
                            tag.removeAttribute('src');
                            console.log('video轉換錯誤', err)
                        }
                        break
                case 'video':
                        let canvas = this.createCanvas(node);
                        tag = document.createElement('img');
                        Array.from(node.attributes, (item) => { 
                            tag.setAttribute(item.name, item.value);
                            tag.innerHTML = node.value;
                        })
                        try {
                            tag.src = canvas.toDataURL("image/png");
                        } catch (err) {
                            tag.removeAttribute('src');
                            console.log('video轉換錯誤', err)
                        }
                        break;
                    case 'INPUT': // 處理input text 標籤
                        if (node.getAttribute('type') === 'text') {
                            tag = document.createElement('div');
                            Array.from(node.attributes, (item) => { 
                                tag.setAttribute(item.name, item.value);
                                tag.innerHTML = node.value;
                            })
                        }
                        break;
                    default:
                            break;
                    }
            tag.classList.add(`layer-${layer}`);
            let style = window.getComputedStyle(node);
            let styleTag = document.createElement('style');
            let styleText = await this.hasPseudoElement(node, tag);
            styleTag.innerHTML = styleText + `${await this.createStyle(style, tag)}`;
            conf.appendChild(tag);
            conf.append(styleTag);
            if (node.childNodes.length > 0) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    await this.compile(node.childNodes[i], tag, `${layer}-${i + 1}`);
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
        let html = document.createElement('html');
        let body = document.createElement('body');
        body.append(this.frag);
        html.append(body);
        foreignObject.append(html);
            document.body.append(svgXml);
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