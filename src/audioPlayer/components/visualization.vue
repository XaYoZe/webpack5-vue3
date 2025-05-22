<template>
  <canvas ref="canvas"></canvas>
</template>
<script>
import * as PIXI from "pixi.js";
window.PIXI = PIXI;
export default {
  props: {
    list: {
      default: Array.from(new Array(10), () => parseInt(Math.random() * 255)),
    }
  },
  data () {
    return {
      // list: Array.from(new Array(10), () => parseInt(Math.random() * 255)),
      app: null,
      pixiConfig: {
          width: 800,
          height: 500,
          antialias: true,
          backgroundAlpha: 0,
        //   resolution: window.devicePixelRatio,
        },
      type: 1,
      length: 10,
      graphicsCache: [],
      topBarCache: [],
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    toCurPX (px) { // 轉換為當前屏幕大小的像素
      return px / (1920 / 100) * (window.innerWidth / 100);
    },
    init () {
        this.pixiConfig.view = this.$refs.canvas;
        this.app = new PIXI.Application(this.pixiConfig);
        // this.app.ticker.add(this.createItem);
        // this.createItem();
    },
    createItem () {
        if (this.type === 0) {
            let graphics = this.graphicsCache[0];
            if (!graphics) {
                graphics =  new PIXI.Graphics();
                this.graphicsCache[0] = graphics
                this.app.stage.addChild(graphics);
            }
            let graphicsWidth = this.pixiConfig.width / this.list.length;
            let prevCoor = [0, this.pixiConfig.height]
            graphics.clear();
            graphics.lineStyle(3, 0xbbeccc, 1);
            let arr = [];
            this.list.forEach((num, index, src) => {
              if (index === 0) {
                graphics.moveTo(graphicsWidth * index, this.pixiConfig.height - num);
              } else {
                let curCoor = prevCoor;
                // let nextCoor = [graphicsWidth * (index + 1), this.pixiConfig.height - src[index + 1]]
                prevCoor = [graphicsWidth * index, this.pixiConfig.height - num]
                // graphics.lineTo(...prevCoor);
                graphics.quadraticCurveTo(...curCoor, ...prevCoor)
              }
            });
            // let graphicsWidth = this.pixiConfig.width / this.list.length;
            // let prevCoor = [0, this.pixiConfig.height]
            // this.list.forEach((num, index) => {
            //      let graphics = this.graphicsCache[index];
            //      if (!graphics) {
            //          graphics =  new PIXI.Graphics();
            //          this.graphicsCache[index] = graphics
            //          this.app.stage.addChild(graphics);
            //      }
            //      graphics.clear();
            //      graphics.lineStyle(3, 0xbbeedd, 1);
            //      graphics.moveTo(...prevCoor);
            //      prevCoor = [graphicsWidth * index, this.pixiConfig.height - num]
            //      graphics.lineTo(...prevCoor);
            //      graphics.closePath();

            // })
        } else if (this.type === 1) {
            this.list.forEach((num, index) => {
                let graphics = this.graphicsCache[index];
                let topBar = this.topBarCache[index];
                let graphicsWidth = this.pixiConfig.width / this.list.length;
                if (!graphics) {
                    graphics = new PIXI.Graphics();
                    this.createLinearGradient(0, 0, graphicsWidth, 255).addColor(0x8d8ef6, 0, 0.5).addColor(0xeeaacc, 0.5, 1).addColor(0xf6ecf5, 1, 1).endFill(graphics);
                    this.app.stage.addChild(graphics);
                    this.graphicsCache[index] = graphics;
                    
                    topBar = new PIXI.Graphics();
                    // topBar.lineStyle(1, 0xbbeedd, 0.5);
                    topBar.beginFill(0xeeaccc, 0.5);
                    topBar.drawRect(0, 0, graphicsWidth, 2);
                    topBar.endFill();
                    topBar.y = this.pixiConfig.height;
                    this.app.stage.addChild(topBar);
                    this.topBarCache[index] = topBar;
                }
                graphics.width = graphicsWidth;
                graphics.x = index * (this.pixiConfig.width) / this.list.length;
                graphics.y = this.pixiConfig.height - num;
                topBar.width = graphicsWidth;
                topBar.x = index * (this.pixiConfig.width) / this.list.length;
                if (topBar.y > this.pixiConfig.height - num) {
                    topBar.y = this.pixiConfig.height - num;
                } else {
                    topBar.y += 0.5;
                }
            })
        }
    },
    // 生成漸變
    createLinearGradient (x, y, w, h) {
        let colorList = [];
        let colorArea = [];
        let colorOpacity = [];
        let obj = {
            addColor,
            endFill
        }
        function addColor (color,size = 0, opacity = 1) {
            colorList.push(color);
            colorOpacity.push(opacity)
            colorArea.push(size);
            return obj
        }
        function endFill (graphics, deg) {
            colorList.forEach((color, index, source) => {
                if (colorList[index + 1]) {
                    let size = Math.ceil((colorArea[index + 1] - colorArea[index]) * h);
                    let baseY = (colorArea[index] * h) + y;
                    let baseOpacity = colorOpacity[index];
                    let opacityStep = (colorOpacity[index + 1] - baseOpacity) / size;
                    let baseRgb = PIXI.utils.hex2rgb(color);
                    let nextRgb = PIXI.utils.hex2rgb(source[index + 1]);
                    let redStep = (nextRgb[0] - baseRgb[0]) / size;
                    let greenStep = (nextRgb[1] - baseRgb[1]) / size;
                    let blueStep = (nextRgb[2] - baseRgb[2]) / size;
                    for (let i = 0; i < size; i++) {
                        let newRgb = [baseRgb[0] + redStep * i, baseRgb[1]  + greenStep * i, baseRgb[2] + blueStep * i]
                        graphics.beginFill(PIXI.utils.rgb2hex(newRgb), baseOpacity + opacityStep * i);
                        graphics.drawRect(x, baseY + i, w, 1);
                    }
                }
            });
        }
        return obj;
    }
  },
  watch: {
    list () {
      this.createItem();
    }
  }
}
</script>
<style lang="scss" scoped>
canvas {}
</style>