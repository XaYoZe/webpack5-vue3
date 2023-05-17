<template>
  <div class="home">
    <div class="drop_box" @drop="drop" @dragover.prevent>拖动TTF到这里</div>
    <div class="text_show">{{ text }}</div>
    <input type="text" v-model="text">
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
import { onMounted, ref } from "vue";
import FontMin from "@js/minFont";
let fontmin = new FontMin().src("/static/AaMaKeTi-2.ttf").dest("build/fonts"); // .src('/static/AaMaKeTi-2.ttf')
onMounted(() => {
  console.log(fontmin.run());
});

let text = ref('你发萨法鸡蛋沙拉');
// 拖動文件
const drop = async (e) => {
  e.preventDefault();
  let file = e.dataTransfer.files[0];
  if (/\.ttf$/.test(file.type || file.name)) {
    let faceFace = new FontFace('font', await file.arrayBuffer());
    await faceFace.load();
    document.fonts.add(faceFace);
    // fontmin.src()
  }
};
</script>

<style lang="scss" scoped>
.home {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  padding: 20px;
  .drop_box {
    width: 100%;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    border: 1px dotted #666;
  }
  .text_show {
    width: 100%;
    min-height: 50px;
    font-family: 'load-font';
  }
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
