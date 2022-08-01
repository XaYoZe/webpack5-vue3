<template>
  <div class="index">
    <router-view></router-view>
  </div>
</template>
<script>
import calendar from './components/calendar';
import scrollNum from './components/scrollNum';

export default {
  components: {calendar, scrollNum},
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.index {}
</style>