<template>
  <div class="home">
    <!-- <catchFishCvs></catchFishCvs> -->
    <textStroke></textStroke>
    <vap></vap>
  </div>
</template>
<script>
import catchFishCvs from './components/catchFishCvs';
import textStroke from './components/textStroke';
import vap from './components/vap';

export default {
  data () {
    return {
    }
  },
  components: {
    catchFishCvs,
    textStroke,
    vap
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