<template>
  <div class="home">
    <div class="drop_box" @drop="drop" @dragover.prevent @click="fileInput.click()">
      <input class="file_input" v-show="false" ref="fileInput" accept=".ttf, .otf, .eot, .woff, .woff2" type="file" @change="drop">
      <div v-if="fontInfo" class="font_info">
        <p v-for="item in field" :key="item.key">
          {{ item.title }}: {{ fontInfo.name[item.key] }}
        </p>
        </div>
      <template v-else>加載字體包</template>
    </div>
    <div class="extract_box">
       <p>提取</p>
       <div class="text_show">{{ extractText }}</div>
       <Textarea v-model="extractText"></Textarea>
    </div>
    <div>
      <p>
        <span>保存設置</span><br/>
        <label for="saveType">保存字體格式: </label> <select id="saveType" v-model="saveType">
          <option value="ttf">ttf</option>
          <option value="eot">eot</option>
          <option value="woff">woff</option>
          <option value="woff">woff2</option>
          <option value="svg">svg</option>
        </select>
      </p>
      <p>
        <span>額外添加</span><br/>
        <label>數字:     <input type="checkbox" value="num" v-model="checkbox.num"></label><br/>
        <label>大寫字母: <input type="checkbox" value="uppercase" v-model="checkbox.uppercase"></label><br/>
        <label>小寫字母: <input type="checkbox" value="lowercase" v-model="checkbox.lowercase"></label><br/>
        <label>英文字符: <input type="checkbox" value="punctuation" v-model="checkbox.punctuation"></label><br/>
      </p>
      <p> 
        <button @click="createTTF()">生成</button> 
      </p>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch, nextTick } from "vue";
import Textarea from '@cpts/Textarea'
import FontMin from "@js/fontMin";

let curFile = "";
let fileInput = ref('')
let extractText = ref('.ttf字体是Windows和Mac的最常见的字体，是一种RAW格式，因此他不为网站优化,支持这种字体的浏览器有【IE9+,Firefox3.5+,Chrome4+,Safari3+,Opera10+,iOS Mobile Safari4.2+】；');
let saveType = ref('ttf');

let fontInfo = ref(null)
let field = [
  {title: '字體名', key: 'fontFamily'},
  {title: '子字体家族', key: 'fontSubFamily'},
  {title: '完整字体名', key: 'fullName'},
  // {title: '唯一字体识别名', key: 'uniqueSubFamily'},
  {title: '版本', key: 'version'},
  {title: '設計', key: 'designer'},
  {title: '製作', key: 'manufacturer'},
  {title: '版權', key: 'copyright'},
  {title: '許可', key: 'licence'},
  {title: '描述', key: 'description'},
]

let fontMin = new FontMin();

const showFont = (buffer, fontName) => {
  let fontFace = new FontFace(fontName, buffer);
  if (fontFace.status === 'error') {
    return false
  }
  document.body.style.fontFamily = fontName;
  document.fonts.add(fontFace);
  return true
}

let checkbox = ref({
  num: false,
  uppercase: false,
  lowercase: false,
  punctuation: false,
})

const createTTF = (fontName) => {
  if (!curFile) {
    console.log('請先導入字體');
    return  
  }
  let range = [];
  for (let key in checkbox.value) {
    if (checkbox.value[key]) {
      range.push(key);
    }
  }
  fontMin.src(curFile).minifly(extractText.value, {range}).then(res => {
    fontMin.download(saveType.value)
    fontInfo.value = fontMin.font.info;
  });
}

// 拖動文件
let fileLoading = false;
const drop = async (e) => {
  e.preventDefault();
  let file = (e.dataTransfer || e.target).files[0];
  curFile = await file.arrayBuffer();
  if (fileLoading) return;
  fileLoading = true
    if (!showFont(curFile, file.name.split('.')[0].split(' ')[0])) {
      fontMin.src(curFile).minifly().then(font => {
        console.log(font.get())
        fontInfo.value = font.get();
        showFont(font.write({type: font.type}), font.data.name.fontFamily)
        fileLoading = false
      })
      return
    } else {
      fontMin.src(curFile).minifly([0]).then(font => {
        fontInfo.value = font.get();
      })
    }
    fileLoading = false
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
    .file_input {

    }
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
        white-space: break-spaces;
        word-break: break-all;
        display: flex;
      }
    }
  }
  .extract_box, .test_box {
    width: 500px;
    padding: 0 20px;
    .text_show {
      width: 100%;
      min-height: 50px;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin-bottom: 10px;
      background: #eee;
    }
    textarea {
      width: 100%;
    }
  }
}
</style>
