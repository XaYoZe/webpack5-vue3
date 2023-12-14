<template>
  <div ref="dom">
    <canvas class="result" width="400" height="400" ref="cvsResult"></canvas>
    <br />
    <!-- <img src="@img/v2.png" ref="img1"> -->
    <img src="../static/mp4.png" ref="img1">
    <img src="@img/v1.png" ref="img2">
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

import VapGl from '@js/vapGl.ts'

let mp4 = ref(require("@static/hero_0.mp4"));
let images = require("@static/mp4.png");
let json = require("@static/hero_0.json");
let fps: Ref = ref(0);

let cvsResult: Ref<HTMLCanvasElement> = ref(null);
let img1 = ref(null);
let img2 = ref(null);
onMounted(() => {
  let vapGl = new VapGl({ el: cvsResult.value, config: json });
  Promise.all([img1.value, img2.value].map(item => {
    return new Promise((resolve) => {
      item.onload = () => {
        resolve(true)
      }
    })
  })).then(res => {
    vapGl.drawImage(img1.value, img2.value);
    console.log('加載圖片完成')
  })
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
