<template>
  <div class="home" @drop="drop" @dragover.prevent>
    <!-- 滚动数字 -->
    <!-- <div class="scroll-container">
        <div class="scroll-list">
            <scrollNum :config="scrollConfig" :select="num" :index="index" v-for="(i, index) in String(num)" :key="String(num).length - index"></scrollNum>
        </div>
        <div class="scroll-ctrl"><input type="text" v-model.number="addNum"><button @click="changeNum">添加</button></div>
    </div> -->
    <!-- <div class="tabs">
        <div class="tab" v-for="(tab) in tabs" :key="tab.name" @click="tabName = tab.name">{{ tab.title }}</div>
    </div> -->
    <!-- <component :is="tabName"></component> -->
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import FontMin from "@js/minFont";
let fontmin = new FontMin().src("/static/AaMaKeTi-2.ttf").dest("build/fonts"); // .src('/static/AaMaKeTi-2.ttf')
onMounted(() => {
  console.log(fontmin.run());
});

// 拖動文件
const drop = async (e) => {
  e.preventDefault();
  let file = e.dataTransfer.files[0];
  console.log(file);
  if (/.ttf$\//.test(file.type)) {
    fontmin.src(await temp1.arrayBuffer())
  }
};
</script>

<style lang="scss" scoped>
.home {
  width: 100vw;
  height: 100vh;
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
