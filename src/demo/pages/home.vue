<template>
  <div class="home">
    <!-- 滚动数字 -->
    <!-- <div class="scroll-container">
        <div class="scroll-list">
            <scrollNum :config="scrollConfig" :select="num" :index="index" v-for="(i, index) in String(num)" :key="String(num).length - index"></scrollNum>
        </div>
        <div class="scroll-ctrl"><input type="text" v-model.number="addNum"><button @click="changeNum">添加</button></div>
    </div> -->
    <div class="tabs">
        <div class="tab" v-for="(tab) in tabs" :key="tab.name" @click="tabName = tab.name">{{ tab.title }}</div>
    </div>
    <component :is="tabName"></component>
  </div>
</template>
<script>
// import calendar from '@cpts/calendar';
// import scrollNum from '@cpts/scrollNum';
// import dom2img from '@cpts/dom2img';
// import giftScroll from '@cpts/giftScroll';
import { defineAsyncComponent } from 'vue';

export default {
  components: {
    calendar:defineAsyncComponent(() => import('@cpts/calendar')),
    scrollNum:defineAsyncComponent(() => import('@cpts/scrollNum')),
    dom2img:defineAsyncComponent(() => import('@cpts/dom2img')),
    giftScroll:defineAsyncComponent(() => import('@cpts/giftScroll')),
  },
  data () {
    return {
        date: new Date(),
        num: 1, // 显示的数字
        addNum: 111,
        tabName: 'giftScroll',
        tabs: [
            {name: 'giftScroll', title: '轉盤'},
            {name: 'calendar', title: '日曆'},
            {name: 'dom2img', title: '下載'}
        ],
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
    display: flex;
    .tabs {
        width: 200px;
        background: #eee8;
        .tab {
            height: 30px;
            text-align: center;
            background: #ace;
            border: 1px solid salmon;
            color: #fff;
        }
    }
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