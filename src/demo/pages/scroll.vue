<template>
  <div class="scroll">
    <ListScroll :list="list" :radius="375" :time="30" reverse >
      <div class="scroll_item" v-for="(item, i) in list" :key="i" >
        {{ i }}
      </div>
    </ListScroll>
  </div>
</template>
<script setup lang="ts">
import  {  reactive } from 'vue';
// import ListScroll from '../components/ListScroll.vue';
let list = reactive(Array(20).fill(1));
console.log(list)

</script>
<style lang="scss" scoped>
.scroll {
  width: 750px;
  height: 500px;
  background: #eee;
  .scroll_item {
    width: 50px;
    height: 150px;
    // background: #eac;
    @for $i from 1 through 20 {
      &:nth-of-type(#{$i}n + 1) {
        background: rgb(random(255), random(255), random(255));
      }
    }
  }
}
</style>
