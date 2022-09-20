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
      cache: []
    }
  },
  mounted () {
    console.log(this.list);
    this.init();
  },
  methods: {
    toCurPX (px) { // 轉換為當前屏幕大小的像素
      return px / (1920 / 100) * (window.innerWidth / 100);
    },
    init () {
        this.pixiConfig.view = this.$refs.canvas;
        this.app = new PIXI.Application(this.pixiConfig);
        this.app.ticker.add(this.createItem);
        // this.createItem();
    },
    createItem () {
        this.list.forEach((num, index) => {
            let item = this.cache[index];
            let itemWidth = this.pixiConfig.width / this.list.length;
            if (!item) {
                item = new PIXI.Graphics();
                item.lineStyle(1, 0xaadd *  num, 0.5);
                item.beginFill(0xffffff, 0.5);
                item.drawRect(0, 0, itemWidth, 255);
                item.endFill();
                this.app.stage.addChild(item);
                this.cache[index] = item;
            }
            item.width = itemWidth;
            item.x = index * (this.pixiConfig.width - itemWidth) / this.list.length;
            item.y = this.pixiConfig.height - num;
        })
      // this.createItem();
    },
    createLinearGradient (x, y, w, h) {
        

        function addColor () {

        }
        return addColor;
    }
  },
  watch: {
  }
}
</script>
<style lang="scss" scoped>
canvas {}
</style>