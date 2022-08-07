<template>
  <div class="index">
    <router-view></router-view>
  </div>
</template>

<script>
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
<script setup>
import { ref, reactive } from 'vue';
import calendar from '@cpt/calendar';
import scrollNum from '@cpt/scrollNum';
let date = new Date(),
    num = ref(11), // 显示的数字
    addNum = ref(121),
    scrollConfig = { // 滚轮配置
        fontSize: 20,
        width: 50,
        duration: 500,
        height: 50,
        items: Array.from(new Array(10), (item, index) => ({ type: 'text', text: index }))
    };
let changeNum = () => {
    console.log(num.value);
    num.value += (Number(addNum.value) || 0);
    //  this.$nextTick(() => {});
};
</script>

<style lang="scss" scoped>
.index {}
</style>