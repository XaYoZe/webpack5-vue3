<template>
  <div class="home">
    <!-- <catchFishCvs></catchFishCvs> -->
    <textStroke></textStroke>
    <vap></vap>
    <vapGl></vapGl>
  </div>
</template>
<script>
import catchFishCvs from './components/catchFishCvs';
import textStroke from './components/textStroke';
import vap from './components/vap';
import vapGl from './components/vapGl';

export default {
  data () {
    return {
    }
  },
  components: {
    catchFishCvs,
    textStroke,
    vap,
    vapGl
  },
  computed: {
  },
  mounted () {

  }
}
</script>

<style lang="scss" scoped>
.home {
  // padding: 50px;
}
</style>