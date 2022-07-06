<template>
  <div>
    <router-link v-for="item in routerList" :key="item.path" replace :to="item.path">demo1</router-link>
  </div>
</template>
<script>
export default {
    computed: {
        routerList () {
           return this.$router.getRoutes().filter((item, index, src) => index && index < src.length - 1)
        }
    },
    mounted () {
        console.log();
    }
}
</script>