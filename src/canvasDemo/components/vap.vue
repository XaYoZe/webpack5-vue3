<template>
  <div ref="dom">
    <div @click="play">播放</div>
    <div>{{fps}}</div>
    <canvas class="result" ref="cvsResult"></canvas>
    <video :src="mp4" ref="video" crossorigin="anonymous" loop playsinline autoplay muted webkit-playsinline preload="auto"></video>
    <!-- <video crossorigin="anonymous" preload="auto" playsinline="" webkit-playsinline="" src="/static/media/hero_0.4dea9ed.mp4" style="display: none;"></video> -->
  </div>
</template>
<script>
import json from '@static/hero_0'
export default {
  data () {
    return {
      mp4: require('@static/hero_0.mp4'),
      fps: 0,
      config:{
        // 精准模式
        accurate: false
      },
      cvs: {
        bg: null,
        src: null,
        result: null
      },
      ctx: {
        bg: null,
        src: null,
        result: null
      },
      video: null,
      animeIndex: null,
      timestamp: 0,
      countFps: 0,
    }
  },
  created () {
    console.log(json);
  },
  mounted () {
    this.init();
  },
  methods: {
    play () {
      this.video.play()
    },
    init () {
      // this.video = document.createElement('video');
      this.video = this.$refs.video;
      // this.video.loop = true;
      // this.video.src = this.mp4;
      // this.video.setAttribute('preload', 'auto');
      // this.video.setAttribute('playsinline', '');
      // this.video.setAttribute('webkit-playsinline', '');
      // this.video.setAttribute('autoplay', '');
      // this.video.setAttribute('muted', '');
      this.video.play();
      this.video.onplay = () => {
        console.log('播放')
        if (!!this.config.accurate && this.video.requestVideoFrameCallback) {
          this.video.requestVideoFrameCallback(this.draw.bind(this))
        } else {
          window.requestAnimationFrame(this.draw);
        }
      }
      this.video.onended = () => {
        // window.cancelAnimationFrame(this.animeIndex);
      }
      this.video.onplaying = (ev) => {}
      this.cvs.screenshot = document.createElement('canvas');
      this.cvs.aFrame = document.createElement('canvas');
      this.cvs.result = this.$refs.cvsResult;
      this.cvs.aFrame.height = this.cvs.result.height = json.info.h;
      this.cvs.aFrame.width = this.cvs.result.width = json.info.w;
      // video截圖
      this.cvs.screenshot.width = json.info.videoW;
      this.cvs.screenshot.height = json.info.videoH;
      this.ctx.screenshot = this.cvs.screenshot.getContext('2d');
      this.ctx.aFrame = this.cvs.aFrame.getContext('2d');
      this.ctx.result = this.cvs.result.getContext('2d');
      console.log(this.ctx.result);
    },
    async draw (a, b) {
      let cvsRect = [0, 0, json.info.w, json.info.h];
      let aRect = [json.info.aFrame[0], json.info.aFrame[1], json.info.aFrame[2], json.info.aFrame[3]];
      // this.ctx.result.globalCompositeOperation = 'color';
      this.ctx.result.clearRect(...cvsRect);
      this.ctx.aFrame.clearRect(...cvsRect);
      this.ctx.screenshot.drawImage(this.video, 0, 0);
      this.ctx.aFrame.drawImage(this.cvs.screenshot, ...aRect, ...cvsRect);
      // 图片合成
      this.synthesisOpacity( this.ctx.screenshot.getImageData(...cvsRect), this.ctx.aFrame.getImageData(...cvsRect));

      // 计算帧数
      let curTimestamp = Date.now();
      // 每隔多久更新一次帧数
      if (this.countFps >= 100) {
          this.fps = parseInt(1000 / (curTimestamp - this.timestamp));
          this.countFps = 0;
      }
      this.countFps += (curTimestamp - this.timestamp);
      this.timestamp = curTimestamp;

      if (!!this.config.accurate && this.video.requestVideoFrameCallback) {
        this.animeIndex = this.video.requestVideoFrameCallback(this.draw.bind(this))
      } else {
        this.animeIndex = window.requestAnimationFrame(this.draw);
      }
    },
    synthesisOpacity (src, bg) {
      let bgImgData = bg.data;
      let rbgaLength = bgImgData.length / 4;
      for (let i = 0; i <= rbgaLength; i++) {
        src.data[(i + 1) * 4 - 1] = bgImgData[i * 4]
      }
        let res = this.ctx.result.createImageData(this.cvs.result.width, this.cvs.result.height, new ImageData(src.data, json.info.w, json.info.h));
        res.data.set(src.data);
        this.ctx.result.putImageData(res, 0, 0);
    }
  }
}
</script>
<style lang="scss" scoped>
video {
  display: none;
}
canvas {
}
</style>