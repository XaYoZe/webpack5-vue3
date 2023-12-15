<template>
  <div ref="dom">
    <div>延遲:{{ yanci }}</div>
    <canvas class="result" width="400" height="400" ref="cvsResult"></canvas>
    <video :src="mp4" ref="video" crossorigin="anonymous" loop playsinline autoplay muted webkit-playsinline preload="auto"></video>
    <br />
    <!-- <img src="@img/v2.png" ref="img1"> -->
    <!-- <img src="../static/mp4.png" ref="img1" />
    <img src="@img/v1.png" ref="img2" /> -->
    <!-- <video crossorigin="anonymous" preload="auto" playsinline="" webkit-playsinline="" src="/static/media/hero_0.4dea9ed.mp4" style="display: none;"></video> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue';

import VapGl from '@js/vapGl.ts';

let mp4 = ref(require('@static/hero_0.mp4'));
let images = require('@static/mp4.png');
let json = require('@static/hero_0.json');
let fps: Ref = ref(0);

let cvsResult: Ref<HTMLCanvasElement> = ref(null);
let video: Ref<HTMLVideoElement> = ref(null);
let img1 = ref(null);
let img2 = ref(null);

let yanci = ref(0);
let debound = 500;
let prevTime = 0;
let offset = 0;
const playWebGl:VideoFrameRequestCallback = function (now, metadata)  {
  if (!offset) {
    offset = Date.now() - now
  }
  //  console.log('渲染', now, metadata);
  this.drawImage(video.value)
  video.value.requestVideoFrameCallback(playWebGl.bind(this))
  if (now - prevTime > 500) {
    yanci.value = Math.round(metadata.expectedDisplayTime - metadata.presentationTime);
    prevTime = now
  }
}
onMounted(() => {
  let vapGl = new VapGl({ el: cvsResult.value, config: json });
  video.value.play();
  video.value.onplay = () => {
    console.log('播放');
    if (video.value.requestVideoFrameCallback) {
      video.value.requestVideoFrameCallback(playWebGl.bind(vapGl))
    } else {
      // window.requestAnimationFrame(this.draw);
    }
  };
  // Promise.all(
  //   [img1.value, img2.value].map((item) => {
  //     return new Promise((resolve) => {
  //       item.onload = () => {
  //         resolve(true);
  //       };
  //     });
  //   })
  // ).then((res) => {
  //   vapGl.drawImage(img1.value, img2.value);
  //   console.log('加載圖片完成');
  // });
});
</script>
<style lang="scss" scoped>
video {
  // display: none;
}
canvas {
  width: 400px;
  height: 400px;
  background: #eee6;
}
</style>
