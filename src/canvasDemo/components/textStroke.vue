<template>
  <canvas class="textStroke" :style="{width: `${width}px`, height: `${height}px`}" ref="cvs"></canvas>
</template>
<script>
export default {
  props: {
    text: {
      default: '1234abcd一二三四.?!*'
    },
    font: {
      default: () => ({
        size: 36,
        color: '#FFFFFF',
        borderWidth: 4,
        borderColor: '#6A3318',
        fontWeight: 'blod'
      })
    }
  },
  data () {
    return {
      // font: {
      //   size: 24,
      //   color: '#ffffff',
      //   borderWidth: 1,
      //   borderColor: '#9A5215',
      //   // lineHeight: 100
      // },
      width: 0,
      height: 0,
      cvs: null,
      ctx: null,
    }
  },
  mounted () {
    if (!this.ctx) {
      this.cvs = this.$refs.cvs;
      this.ctx = this.cvs.getContext('2d');
    }
    this.setFont(false);
    let measureText = this.ctx.measureText(this.text);
    this.width = measureText.actualBoundingBoxLeft + measureText.actualBoundingBoxRight + this.toCurPX(this.font.borderWidth) * 2;
    this.cvs.width = this.width * window.devicePixelRatio;;
    this.height = measureText.actualBoundingBoxAscent + measureText.actualBoundingBoxDescent + this.toCurPX(this.font.borderWidth) * 2;
    this.cvs.height = this.height * window.devicePixelRatio;
    this.crateText(measureText);
  },
  methods: {
    toCurPX (px, isCvs = true) { // 轉換為當前屏幕大小的像素
      // return px
      return px / (750 / 100) * (window.innerWidth / 100) * (isCvs ? window.devicePixelRatio : 1);
    },
    crateText (measureText) {
      // this.ctx.restore();
      this.setFont(true);
      this.ctx.fillText(this.text, measureText.actualBoundingBoxLeft + this.toCurPX(this.font.borderWidth), measureText.actualBoundingBoxAscent + this.toCurPX(this.font.borderWidth));
      this.ctx.strokeText(this.text, measureText.actualBoundingBoxLeft + this.toCurPX(this.font.borderWidth), measureText.actualBoundingBoxAscent + this.toCurPX(this.font.borderWidth));
    },
    setFont (isCvs) {
      this.ctx.font = `${this.font.fontWeight ? `${this.font.fontWeight} ` : ''}${this.toCurPX(this.font.size, isCvs)}px PingFang`;
      this.ctx.strokeStyle = this.font.borderColor;
      this.ctx.lineWidth = this.toCurPX(this.font.borderWidth, isCvs);
      this.ctx.fillStyle = this.font.color;
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
    }
  },
  watch: {
    text () {
      this.crateText();
    }
  }
}
</script>
<style lang="scss" scoped>
.textStroke {
  height: 100%;
}
</style>