<template>
  <div ref="dom">
    <div @click="play">播放</div>
    <div>{{ fps }}</div>
    <canvas class="result" ref="cvsResult"></canvas>
    <!-- <video
      :src="mp4"
      ref="video"
      crossorigin="anonymous"
      loop
      playsinline
      autoplay
      muted
      webkit-playsinline
      preload="auto"
    ></video> -->
    <!-- <video crossorigin="anonymous" preload="auto" playsinline="" webkit-playsinline="" src="/static/media/hero_0.4dea9ed.mp4" style="display: none;"></video> -->
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";

let mp4 = ref(require("@static/hero_0.mp4"));
let images = require("@static/mp4.png");
let json = require("@static/hero_0.json");
let fps: Ref = ref(0);

// 顶点着色器源码
let vertexShaderSource = `void main () {
  // 声明顶点位置, 对应X,Y,X,W W为齐次坐标
  gl_Position = vec4(0, 0, 1, 1);
  // 声明点大小 必须浮点类型
  gl_PointSize = 10.0;
}`;

// 片元着色器源码
let fragmentShaderSource = `void main () {
  // 设置填充颜色 对应 RGBA
  gl_FragColor = vec4(0, 0.5, 0.5, 1.0);
}`;

class VapGl {
  canvas: HTMLCanvasElement = null;
  webgl: WebGLRenderingContext = null;
  constructor(config) {
    this.canvas = config.el;
    this.initCanvas();
  }
  initCanvas() {
    this.webgl = this.canvas.getContext("webgl", { alpha: true });
    // 生成顶点着色器对象
    var vertexShader = this.createShader(this.webgl, this.webgl.VERTEX_SHADER, vertexShaderSource);
    // 生成片元着色器对象
    var fragmentShader = this.createShader(this.webgl, this.webgl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!(vertexShader && fragmentShader)) return;
    // 生成着色器程序
    var program = this.createProgram(this.webgl, vertexShader, fragmentShader);
    
    // 使用着色器程序
    this.webgl.useProgram(program);

    // 用来设置视口
    this.webgl.viewport(0, 0, this.canvas.width, this.canvas.height);
    
    // 设置清空画布的颜色
    this.webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 清空画布
    this.webgl.clear(this.webgl.COLOR_BUFFER_BIT);

    // 绘制点
    this.webgl.drawArrays(this.webgl.POINTS, 0, 1);
    console.log(this.webgl);
  }
  /**
   * 生成着色器对象
   * @param { WebGLRenderingContext } gl  webgl上下文
   * @param {(gl.FRAGMENT_SHADER|gl.VERTEX_SHADER)} type 着色器类型
   * @param {String} shaderSource 着色器源码
   * @returns { WebGLShader|viod } 着色器对象
   **/
  createShader(gl:WebGLRenderingContext , type:number , shaderSource:string):WebGLShader|void {
    // 创建着色器对象
    var shader = gl.createShader(type);
    // 设置着色器源码
    gl.shaderSource(shader, shaderSource);
    // 编译着色器
    gl.compileShader(shader);
    // 查看着色器编译状态
    var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (status) return shader;
    // 打印着色器编译日志
    console.log(gl.getShaderInfoLog(shader));
  }
  /**
   * 生成着色器程序
   * @param { WebGLRenderingContext }  gl webgl上下文
   * @param vertexShader 顶点着色器对象
   * @param fragmentShader 片元着色器对象
   *
   */
  createProgram(gl:WebGLRenderingContext, vertexShader:WebGLShader, fragmentShader:WebGLShader):WebGLProgram|void {
    // 创建着色器程序对象
    var program = gl.createProgram();
    // 为着色器程序添加着色器对象
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // 链接着色器程序到上下文
    gl.linkProgram(program);
    // 着色器程序连接状态
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    // 着色器连接日志
    console.log(gl.getProgramInfoLog(program));
  }
  /**
   * @param {string} str 图片路径
   */
  drawImage(str:string) {

  }
}

let cvsResult: Ref<HTMLCanvasElement> = ref(null);
onMounted(() => {
  let vapGl = new VapGl({ el: cvsResult.value, config: json });
  vapGl.drawImage(images);
});

// import json from '@static/hero_0'
// export default {
//   data () {
//     return {
//       mp4: require('@static/hero_0.mp4'),
//       fps: 0,
//       config:{
//         // 精准模式
//         accurate: false
//       },
//       cvs: {
//         bg: null,
//         src: null,
//         result: null
//       },
//       ctx: {
//         bg: null,
//         src: null,
//         result: null
//       },
//       video: null,
//       animeIndex: null,
//       timestamp: 0,
//       countFps: 0,
//     }
//   },
//   created () {
//     console.log(json);
//   },
//   mounted () {
//     this.init();
//   },
//   methods: {
//     play () {
//       this.video.play()
//     },
//     init () {
//       // this.video = document.createElement('video');
//       this.video = this.$refs.video;
//       // this.video.loop = true;
//       // this.video.src = this.mp4;
//       // this.video.setAttribute('preload', 'auto');
//       // this.video.setAttribute('playsinline', '');
//       // this.video.setAttribute('webkit-playsinline', '');
//       // this.video.setAttribute('autoplay', '');
//       // this.video.setAttribute('muted', '');
//       this.video.play();
//       this.video.onplay = () => {
//         console.log('播放')
//         if (!!this.config.accurate && this.video.requestVideoFrameCallback) {
//           this.video.requestVideoFrameCallback(this.draw.bind(this))
//         } else {
//           window.requestAnimationFrame(this.draw);
//         }
//       }
//       this.video.onended = () => {
//         // window.cancelAnimationFrame(this.animeIndex);
//       }
//       this.video.onplaying = (ev) => {}
//       this.cvs.screenshot = document.createElement('canvas');
//       this.cvs.aFrame = document.createElement('canvas');
//       this.cvs.result = this.$refs.cvsResult;
//       this.cvs.aFrame.height = this.cvs.result.height = json.info.h;
//       this.cvs.aFrame.width = this.cvs.result.width = json.info.w;
//       // video截圖
//       this.cvs.screenshot.width = json.info.videoW;
//       this.cvs.screenshot.height = json.info.videoH;
//       this.ctx.screenshot = this.cvs.screenshot.getContext('2d');
//       this.ctx.aFrame = this.cvs.aFrame.getContext('2d');
//       this.ctx.result = this.cvs.result.getContext('2d');
//       console.log(this.ctx.result);
//     },
//     async draw (a, b) {
//       let cvsRect = [0, 0, json.info.w, json.info.h];
//       let aRect = [json.info.aFrame[0], json.info.aFrame[1], json.info.aFrame[2], json.info.aFrame[3]];
//       // this.ctx.result.globalCompositeOperation = 'color';
//       this.ctx.result.clearRect(...cvsRect);
//       this.ctx.aFrame.clearRect(...cvsRect);
//       this.ctx.screenshot.drawImage(this.video, 0, 0);
//       this.ctx.aFrame.drawImage(this.cvs.screenshot, ...aRect, ...cvsRect);
//       // 图片合成
//       this.synthesisOpacity( this.ctx.screenshot.getImageData(...cvsRect), this.ctx.aFrame.getImageData(...cvsRect));

//       // 计算帧数
//       let curTimestamp = Date.now();
//       // 每隔多久更新一次帧数
//       if (this.countFps >= 100) {
//           this.fps = parseInt(1000 / (curTimestamp - this.timestamp));
//           this.countFps = 0;
//       }
//       this.countFps += (curTimestamp - this.timestamp);
//       this.timestamp = curTimestamp;

//       if (!!this.config.accurate && this.video.requestVideoFrameCallback) {
//         this.animeIndex = this.video.requestVideoFrameCallback(this.draw.bind(this))
//       } else {
//         this.animeIndex = window.requestAnimationFrame(this.draw);
//       }
//     },
//     synthesisOpacity (src, bg) {
//       let bgImgData = bg.data;
//       let rbgaLength = bgImgData.length / 4;
//       for (let i = 0; i <= rbgaLength; i++) {
//         src.data[(i + 1) * 4 - 1] = bgImgData[i * 4]
//       }
//         let res = this.ctx.result.createImageData(this.cvs.result.width, this.cvs.result.height, new ImageData(src.data, json.info.w, json.info.h));
//         res.data.set(src.data);
//         this.ctx.result.putImageData(res, 0, 0);
//     }
//   }
// }
</script>
<style lang="scss" scoped>
video {
  // display: none;
}
canvas {
}
</style>
