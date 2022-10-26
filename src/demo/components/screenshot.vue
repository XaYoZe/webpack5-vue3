<template>
  <div class="screenshot">
    <slot ref="slot"></slot>
    <div ref="clone"></div>
  </div>
</template>
<script>
export default {
    data () {
        return {
            frag: document.createDocumentFragment(),
            mineType: {
                jpeg: "image/jpeg",
                png:  "image/png",
                gif:   "image/gif",
                svg:  "image/svg+xml"
            },
            cache: {

            }
        }
    },
    mounted () {
        setTimeout(() => {
            // this.init();
        }, 100)
    },
    methods: {
        // uint8Array 转bese64
        bufferToBase64 (array) {
            let base64 = '';
            array.forEach(item => {
                base64 += String.fromCharCode(item);
            });
            return window.btoa(base64);
        },
        // 获取图片转成base64
        getPic  (src) {
            if (this.cache[src]) {
                return Promise.resolve(this.cache[src]);
            }
            let mineType = '';
            // fetch(src).then(async res => {console.time('文件計時');
            return fetch(src).then(async res => {
                let blob = await res.blob();
                mineType = blob.type;
                return new Uint8Array(await blob.arrayBuffer());
            }).then(res => {
                let base64 = `data:${mineType};base64,` +this.bufferToBase64(res);
                this.cache[src] = base64;
                return base64
            }).catch(err => {
                console.log('获取图片错误');
            })
        },
        init () {
           this.compile(this.$el, this.frag).then(res => {
               this.createSvg();
           });
        },
        // 复制节点
        async compile (node, conf) {
            if (node.nodeType == 1) {
                let tag = node.cloneNode();
                if (node.tagName === 'IMG') {
                    tag.src = await this.getPic(node.src);
                }
                let style = window.getComputedStyle(node);
                for (var key in tag.style) {
                    let styleText = style[key];
                    if (/^grid/.test(key)) {
                        if (styleText === 'none') {
                            continue
                        }
                        console.log(key, styleText);
                    };
                    if (styleText && typeof styleText === 'string' && styleText !== tag.style[key]) {
                        
                        if (/url\(.*\)/.test(styleText) && !/url\(data:.*\)/.test(styleText)) {
                            let urlReg = /url\(["'](.*?)['"]\)/g;
                            let newStyle = styleText;
                            let urlExec = '';
                            // console.log(`${key}: ${styleText}`);
                            while (urlExec = urlReg.exec(styleText)) {
                               console.log(key, urlExec[1]);
                               let src = await this.getPic(urlExec[1]);
                               newStyle = newStyle.replace(urlExec[1], src);
                            }
                            styleText = newStyle;
                        }
                        try {
                            tag.style[key] = styleText;
                        } catch (err) {
                            console.log(err);
                        }
                    }
                }
                conf.appendChild(tag);
                 if (node.childNodes.length > 0) {
                     for  (let i = 0; i < node.childNodes.length; i++) {
                        await this.compile(node.childNodes[i], tag);
                     }
                 }
            }
            if (node.nodeType == 3) {
                conf.append(document.createTextNode(node.nodeValue));
            }
        },
        // 生成svg
        createSvg (w, h) {
            // 生成svg
            let width = w || this.$el.offsetWidth;
            let height = h || this.$el.offsetHeight;
            let svgXml = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            svgXml.setAttribute('xmlns', "http://www.w3.org/2000/svg");
            svgXml.setAttribute('width', width);
            svgXml.setAttribute('height', height);
            foreignObject.setAttribute('width', width);
            foreignObject.setAttribute('height', height);
            svgXml.appendChild(foreignObject);
            foreignObject.append(this.frag);
            // 格式化
            var serializer = new XMLSerializer();
            var source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svgXml);
       

            let url = window.URL.createObjectURL(new Blob([source]));
            console.log(url);
                 
            let a = document.createElement('a');
            a.href = url;
            a.download = "download";
            a.click();
            // 加载成图片
            var image = new Image;
            image.width = width;
            image.height = height;
            // console.log(source);
            // image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            image.src = url;
            image.onload = function () {
                // 生成画布
                var canvas = document.createElement('canvas');  //准备空画布
                canvas.width = width * window.devicePixelRatio;
                canvas.height = height * window.devicePixelRatio;

                var context = canvas.getContext('2d');  //取得画布的2d绘图上下文
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                // 下載
                // let a = document.createElement('a');
                // a.href = canvas.toDataURL("image/png");
                // a.download = "download";
                // a.click();

                document.body.append(svgXml);
                document.body.append(image);
                // document.body.append(canvas);
            }

            // console.log(svgXml, foreignObject);
        }
    }
}
</script>
<style lang="scss" scoped>
.screenshot {}
</style>