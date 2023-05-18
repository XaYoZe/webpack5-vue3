<template>
  <div class="home">
    <div class="drop_box" @drop="drop" @dragover.prevent>
      <div v-if="fontInfo" class="font_info">
        <p v-for="item in field" :key="item.key">
          {{ item.title }}: {{ fontInfo.name[item.key] }}
        </p>
        </div>
      <template v-else>拖动TTF到这里</template>
    </div>
    <div class="extract_box">
       <p>提取</p>
       <div class="text_show">{{ extractText }}</div>
       <Textarea v-model="extractText"></Textarea>
       <button @click="createTTF('font_test')">生成</button> 
    </div>
    <div class="test_box">
      <p>測試</p>
      <div class="text_show">{{ testText }}</div>
      <Textarea v-model="testText"></Textarea>
       <button @click="download()">下載</button> 
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch, nextTick } from "vue";
import Textarea from '@cpts/Textarea'
import FontMin from "@js/minFont";

let fontmin = new FontMin();

let extractText = ref('.ttf字体是Windows和Mac的最常见的字体，是一种RAW格式，因此他不为网站优化,支持这种字体的浏览器有【IE9+,Firefox3.5+,Chrome4+,Safari3+,Opera10+,iOS Mobile Safari4.2+】；');

let testText = ref('');

let curFile = "";
let fontInfo = ref(null)
let field = [
  {title: '字體名', key: 'fontFamily'},
  {title: '設計', key: 'designer'},
  {title: '版權', key: 'copyright'},
  {title: '許可', key: 'licence'},
  {title: '描述', key: 'description'},
]
const showFont = async (buffer, fontName) => {
  let faceFace = new FontFace(fontName, buffer);
  await faceFace.load();
  document.fonts.add(faceFace);
  console.log('字體加載');
}

const createTTF = (fontName) => {
  if (!curFile) {
    console.log('請先導入字體');
    return  
  }
  testText.value = extractText.value;
  fontmin.src(curFile).run(extractText.value).then(res => {
    console.log(res, 132456)
    fontInfo.value = res.object;
    showFont(res.buffer, fontName);
  })
}

// 拖動文件
const drop = async (e) => {
  e.preventDefault();
  let file = e.dataTransfer.files[0];
  if (/\.ttf$/.test(file.type || file.name)) {
     curFile = await file.arrayBuffer();
     createTTF('font_draw')
    // fontmin.src()
  }
};

onMounted(async () => {});

</script>

<style lang="scss" scoped>
.home {
  width: 100vw;
  height: 100vh;
  padding: 20px;
  display: flex;
  .drop_box {
    width: 300px;
    min-height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    border: 1px dotted #666;
    padding: 10px;
    .font_info {
      p {
        display: flex;
      }
    }
  }
  .extract_box, .test_box {
    width: 300px;
    padding: 20px;
    .text_show {
      width: 100%;
      min-height: 50px;
      font-family: 'font_draw';
      white-space: pre-wrap;
      word-wrap: break-word;
      margin-bottom: 10px;
    }
    textarea {
      width: 100%;
    }
  }
  .test_box {
    .text_show {
      font-family: 'font_test';
    }
  }
}
</style>
