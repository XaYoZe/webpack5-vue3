<template>
  <div>
    <ul class="tab_list">
      <li v-for="(value, key) in tabList" :key="key" @click="activeCMT = value">{{  key }}</li>
    </ul>
    <component :is="activeCMT"></component>
  </div>
</template>
<script setup>

import { defineAsyncComponent, ref } from 'vue'

const getDevicesScreen = defineAsyncComponent(() => import('../components/getDevicesScreen'));
const mp3PlayToAudioJs = defineAsyncComponent(() => import('../components/mp3PlayToAudioJs'));
const mp3PlayToAudioTag = defineAsyncComponent(() => import('../components/mp3PlayToAudioTag'));
const readyID3 = defineAsyncComponent(() => import('../components/readyID3'));

const activeCMT = ref(mp3PlayToAudioJs)
const tabList = {
  getDevicesScreen,
  mp3PlayToAudioJs,
  mp3PlayToAudioTag,
  readyID3
}

</script>

<style lang="scss">
.home {
  .tab_list {
    li {
      height: 20px;
      padding: 10px 20px;
    }
  }
}
</style>