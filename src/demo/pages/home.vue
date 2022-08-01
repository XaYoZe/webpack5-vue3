<template>
  <div class="home">
    <!-- 日历 -->
    <calendar></calendar>
    <!-- 滚动数字 -->
    <div class="scroll-container">
        <div class="scroll-list">
            <scrollNum :config="scrollConfig" :select="num" :index="index" v-for="(i, index) in String(num)" :key="String(num).length - index"></scrollNum>
        </div>
        <div class="scroll-ctrl"><input type="text" v-model.number="addNum"><button @click="changeNum">添加</button></div>
    </div>
  </div>
</template>
<script>
import calendar from '@cpts/calendar';
import scrollNum from '@cpts/scrollNum';

export default {
  components: {calendar, scrollNum},
  data () {
    return {
        date: new Date(),
        num: 1, // 显示的数字
        addNum: 111,
        scrollConfig: { // 滚轮配置
            fontSize: 20,
            width: 50,
            duration: 500,
            height:  50,
            items: Array.from(new Array(10), (item, index) => ({type: 'text', text: index}))
        }
    }
  },
  computed: {
  },
  methods: {
    changeNum () {
         this.num+=(Number(this.addNum) || 0);
        //  this.$nextTick(() => {});
     }
  }
}
</script>

<style lang="scss" scoped>
.home {
    .scroll-container {
        .scroll-list {
            display: flex;
            margin: 100px auto 0;
            border: 1px solid #eee;
            width: max-content;
            overflow: hidden;
        }
        .scroll-ctrl {
            margin: 50px auto 0;
            width: max-content;
            input {
                margin-right: 10px;
            }
        }

    }
}
</style>