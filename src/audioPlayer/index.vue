<template>
  <div class="home">
    <component :is="name"></component>
    <router-view></router-view>
  </div>
</template>
<script>
import mp3PlayToAudioJs from './components/mp3PlayToAudioJs'
import mp3PlayToAudioTag from './components/mp3PlayToAudioTag'
import mp3PlayToAudioJsRe from './components/mp3PlayToAudioJsRe'

export default {
  components: {mp3PlayToAudioJs, mp3PlayToAudioTag, mp3PlayToAudioJsRe},
  data () {
    return {
      tag: '标签',
      name: 'mp3PlayToAudioJs'
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