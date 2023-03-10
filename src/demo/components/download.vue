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
                  <input class="text" type="text" value="123">
                </div>
              </div>
              <div class="right">
                <div style="position: absolute; bottom: 0; left: 20px;width:80px;height: 50px;background: #cda;background-size: 100%;" :style="{'background-image': `url('${require('@img/09(11).png')}')`}"></div>
                <img ref="img" title="DSASDA" src="@img/07.jpeg">
                <div class="first-row">
                  <div></div>
                </div>
                <div class="next-row"></div>
              </div>
          </div>
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
    <div class="style-test">
      <div class="block-out" id="blockOut">
        <div class="block-in" id="blockIn" style="width: 50px;height: 50px;margin-bottom: 50px;background: #4991bb;"></div>
      </div>
      <div class="block1"></div>
    </div>
  </div>
</template>
<script>
import El2Image from '@js/el2Img';
import domToImage from '@js/dom-to-image';
export default {
  data() {
    return {
      imgList: [],
      el2Image: null,
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
        let img = new Image();
        img.src = require('@img/09(11).png');
        ctx.fillStyle = '#acdacd';
        img.onload = () => {
            ctx.drawImage(img, 0, 0, 300, 250);
            ctx.fillRect(10,10, 20, 20);
        }
    },
    async clickDownLoad () {
        // domToImage.toSvg(this.$refs.source).then(res => {
        //   let img = new Image();
        //   img.src = res;
        //   this.$refs.svg.append(img);
        // })
        let imgSrc = await this.el2Image.draw({el: this.$refs.source });    
        let img = new Image();
        img.src = imgSrc;
        this.$refs.img.append(img);
        this.$refs.svg.append(this.el2Image.svgEl);
        this.$refs.canvas1.append(this.el2Image.canvasEl);
          // let a = document.createElement('a');
          // a.href = this.el2Image.svgEl; //window.URL.createObjectURL(new Blob([this.el2Image.svgE]));
          // a.download = 'img.svg';
          // a.click();
        // this.$refs.svg.append();
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
        > img {
          width: 250px;
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
        font-family: shaonu;
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
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
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
  .style-test {
    padding-left: 100px;
    .block-out {
      height: auto;
      width: max-content;
      .block-in {
      }
    }
    .block1 {
      background: #bad;
      width: 50px;
      height: 50px;
    }
  }
}
</style>