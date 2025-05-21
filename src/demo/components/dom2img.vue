<template>
  <div class="view">
    <button @click="clickDownLoad">繪製</button>
    <div class="view-content">
      <div class="source">
        <div class="title">
          節點
        </div>
        <div class="content" ref="source">
          <canvas ref="canvas"></canvas>
          <div class="main" ref="main">
              <div class="top">文本文本</div>
              <div class="left">
                <div style="background: #cda;">
                  <input class="text" type="text" :value="inputValue">
                  <input type="checkbox" :checked="checkBoxValue">
                  <input type="radio" :checked="checkBoxValue">
                </div>
              </div>
              <div class="right">
                <div style="position: absolute; bottom: 0; left: 20px;width:80px;height: 60px;background: #cda;background-size: 100%;" :style="{'background-image': `url('${require('@img/08.jpg')}')`}"></div>
                <img ref="img" title="DSASDA" src="@img/07.jpeg">
                <div class="first-row">
                  <div></div>
                </div>
                <div class="next-row"></div>
              </div>
          </div>
          <img v-for="i in 6"  :key="i" :src="require(`@img/${i}.jpg`)">
        </div>
      </div>
      <div class="svg" ref="svg">
        <div class="title">
          svg
        </div>
      </div>
      <div class="canvas" ref="canvas1">
        <div class="title">
          canvas
        </div>
      </div>
      <div class="img" ref="img">
        <div class="title">
          img
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import El2Image from '@js/el2Img';
// import domToImage from '../assets/js/dom-to-image';
export default {
  data() {
    return {
      imgList: [],
      el2Image: null,
      checkBoxValue: true,
      inputValue: 515
    };
  },
  mounted () {
    this.initCanvas();
    this.el2Image = new El2Image();
    window.el2Image = this.el2Image;
  },
  methods: {
    initCanvas () {
        let ctx = this.$refs.canvas.getContext('2d');
        this.$refs.canvas.style.width = '250px';
        this.$refs.canvas.style.height = '125px';
        this.$refs.canvas.width = 250 * 3;
        this.$refs.canvas.height = 125 * 3;
        let img = new Image();
        img.src = require('@img/09(11).png');
        ctx.fillStyle = '#acdacd';
        img.onload = () => {
            ctx.drawImage(img, 0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
            ctx.fillRect(10,10, 20, 20);
        }
    },
    async clickDownLoad () {
        console.time('創建圖片1');
        this.el2Image.draw(this.$refs.source, {type: 'debug', width: 125}).then(res => {
          console.timeEnd('創建圖片1');
          if (typeof res === 'string') {
            let img = new Image();
            img.src = res;
            this.$refs.img.append(img);
          } else {
            this.$refs.svg.append(res);
          }
        });    

        // console.time('創建圖片');
        // domToImage.toPng(this.$refs.source).then(res => {
        //   console.timeEnd('創建圖片');
        //   let img = new Image();
        //   img.src = res;
        //   this.$refs.svg.append(img);
        // })
    },
  },
};
</script>
<style scoped lang="scss">
.view {
  width: 100%;
  margin: 50px 20px;
  button {
    width: 100px;
    height: 50px;
    border-radius: 25px;
    margin: 0 auto;
  }
  .view-content {
    display: flex;
    margin: 50px 0 100px;
    > div {
      width: 250px;
      .title {
        text-align: center;
        font-size: 20px;
        margin-bottom: 10px;
      }
      margin-left: 20px;
      .content {
        &:deep(img) {
          width: 250px;
          display: block;
        }
      }
    }
  }
  .source {
    width: 250px;
    canvas {
      width: 100%;
    }
    .main {
      width: 250px;
      position: relative;
      background: radial-gradient(#fff, #f1c000 , #bad);
      display: grid;
      grid-template-areas: "top top top" "left right right"  "left right right" ;
      grid-template-columns: 50px 100px 100px;
      grid-template-rows: 50px 100px 100px;
      ul {
          padding-left: 50px;
          li {
              padding-block: 10px 20px;
          }
      }
      .top {
        grid-area: top;
        // line-height: 50px;
        font-family: shaonu,sans-serif;
        font-size: 16px;
        color: rgb(10, 120, 120);
        background: #cad;
        line-height: 50px;
        &::before {
           content: '';
           margin-right: 10px;
          vertical-align: middle;
          display: inline-block;
          width: 50px;
          height: 50px;
          background: rgb(170, 204, 194);
          border-radius: 50%;
        }
      }
      .left {
        grid-area: left;
        background: #cba;
        position: relative;
        input {
          padding: 0;
          margin: 0;
          width: 100%;
          font-size: 24px;
          color: #bad;
          border: 1px solid;
        }
        > div {
          height: auto;
        }
      }
      .right {
        grid-area: right;
        background: url("~@img/29.jpg") no-repeat right 0 / 100px,
          url(~@img/08.jpg) no-repeat right 50px / 100px;
        justify-content: center;
        align-items: center;
        position: relative;
        img {
          // height: 100%;
          width: 100px;
          height: 140px;
          display: block;
        }
        .first-row {
          width: 20px;
          > div {
            background: #cad;
            height: 20px;
            margin-bottom: 20px;
          }
        }
        .next-row {
          width: 20px;
          height: 20px;
          background: #4991bb;
        }
      }
    }
  }
  .img {
    > :v-deep img {
      width: 250px;
    }
  }
}
</style>