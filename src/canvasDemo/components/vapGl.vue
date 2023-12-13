<template>
  <div ref="dom">
    <canvas class="result" width="800" ref="cvsResult"></canvas>
    <br />
    <img src="@img/1.png" ref="img1">
    <!-- <img src="../static/mp4.png" ref="img1"> -->
    <img src="@img/2.png" ref="img2">
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
  vapGl.drawImage(img1.value, img2.value);
});
</script>
<style lang="scss" scoped>
video {
  // display: none;
}
canvas {
  width: 800px;
  height: 500px;
  background: #eee6;
}
</style>
