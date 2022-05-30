<template>
  <div class="home">
    <h1>啥都没有</h1>
    <% if (router) { %><router-view></router-view><% } %>
  </div>
</template>
<script>
export default {
  data () {
    return {
    }
  },
  computed: {
  },
  mounted () {

  }
}
</script>

<style lang="scss" scoped>
.home {}
</style>