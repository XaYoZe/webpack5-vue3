<template>
  <canvas ref="canvas"></canvas>
</template>
<script>
export default {
  props: {
    list: {
      // default: Array.from(new Array(10), () => parseInt(Math.random() * 255)),
    }
  },
  data () {
    return {
      // list: Array.from(new Array(10), () => parseInt(Math.random() * 255)),
      canvas: null,
      ctx: null,
      width: 5,
      drawData: [], // 報存畫布數據
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
      if (!this.canvas) {
        this.canvas = this.$refs.canvas;
      }
      this.ctx = this.canvas.getContext('2d'); // 绘制2D
      this.canvas.width = this.canvas.parentElement.offsetWidth; // 設置畫布寬度
      this.canvas.height = this.canvas.parentElement.offsetHeight; // 設置畫布高度
      // this.createItem();
    },
    createItem () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.list.forEach((item, index) => {
        let w = this.toCurPX(this.width);
        let b = this.canvas.height; // 底部坐標
        let x = (index * this.canvas.width / this.list.length) + 0;
        let y = item * this.canvas.height / 255; // 
        this.drawData[index] = { x, y };
        let grad = this.ctx.createLinearGradient(x,b - y,x, b);
        grad.addColorStop(0,"#fff9");  // 添加漸變顏色
        grad.addColorStop(0.333,"#e999");  // 添加漸變顏色
        grad.addColorStop(0.666,"#75fcb896"); // 添加漸變顏色
        grad.addColorStop(1,"#d2f53662"); // 添加漸變顏色
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(x, b - y, w, y);
      })
      // console.log(this.drawData);
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
canvas {
  width: 1080px;
  height: 500px;
}
</style>