<template>
  <div class="home">
    <component :is="name"></component>
    <router-view></router-view>
  </div>
</template>
<script>
import getDevicesScreen from './components/getDevicesScreen'
import mp3PlayToAudioJs from './components/mp3PlayToAudioJs'
import mp3PlayToAudioTag from './components/mp3PlayToAudioTag'
import readyID3 from './components/readyID3'

export default {
  components: {getDevicesScreen, mp3PlayToAudioJs, mp3PlayToAudioTag, readyID3},
  data () {
    return {
      tag: '标签',
      name: 'readyID3'
    }
  },
  computed: {
    test () {
      let a = {a: 1, b: 2, c: 3};
      let arr = Object.values(a);
      return arr;
    }
  },
  mounted () {

  }
}
</script>

<style lang="scss" scoped>
.home {
  .pathTest {
    width: 300px;
    margin-bottom: 20px;
    img {
      max-width: 100%;
    }
  }
}
</style>