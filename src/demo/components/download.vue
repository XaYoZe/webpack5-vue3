<template>
  <div class="view">
    <input
      id="dirFile"
      @change="changeFile"
      type="file"
      name="file"
      webkitdirectory
      directory
    />
    <button @click="clickDownLoad">下載</button>
    <screenshot ref="screenshot">
        <div class="main">
            <div class="top">你不是真正的快樂</div>
            <div class="left">
              <input type="text" value="123">
            </div>
            <div class="right"><img src="@img/07.jpeg">
            <ul>
               <li>1</li>
            </ul>
            </div>
        </div>
      <!-- <div id="dirImgBox" ref="dirImgBox">
        <div id="dirFileBox" onclick="dirFile.click()">
          <i>+</i>
        </div>
      </div> -->
    </screenshot>
  </div>
</template>
<script>
import screenshot from "@cpts/screenshot";
export default {
  components: { screenshot },
  data() {
    return {
      imgList: [],
    };
  },
  methods: {
    clickDownLoad () {
        this.$refs.screenshot.init();
    },
    bufferToBase64(array) {
      let base64 = "";
      array.forEach((item) => {
        base64 += String.fromCharCode(item);
      });
      return window.btoa(base64);
    },
    // 轉base64
    // let base64Pic = ``;
    changeFile(e) {
      var imgHeightList = [];
      var imgWidth = 200;
      var imgLoadIndex = 0;
      var dirImgBoxWidth = this.$refs.dirImgBox.offsetWidth;
      let max = 20; // 最大加載圖片
      let index = 0;
      let colspanCount = parseInt(dirImgBoxWidth / (imgWidth + 22));
      new Array().forEach.call(this.$refs.dirImgBox.children, (v, i) => {
        // 清空容器
        v.remove();
      });
      console.log(dirFile.files);
      Array.from(dirFile.files, async (v, i) => {
        var img = new Image();
        var div = document.createElement("div");
        let flag = false;
        if (
          ["image/jpeg", "image/png", "image/gif", "image/svg+xml"].indexOf(
            v.type
          ) === -1
        ) {
          return;
        }
        console.log(v);
        let u8a = new Uint8Array(await v.arrayBuffer());
        let base64 = `data:${v.type};base64,` + this.bufferToBase64(u8a);
        // console.log(v.type,  base64);
        if (index > max) {
          return;
        }
        index++;
        img.src = window.URL.createObjectURL(v); //创建路径对象
        this.$refs.dirImgBox.appendChild(div);
        img.onload = () => {
          div.style.width = imgWidth + "px"; // 給圖片容器設置寬度
          div.style.height = Math.ceil((imgWidth / img.width) * img.height) + "px"; // 按照圖片比例給容器設置高度
          if (imgLoadIndex < colspanCount) {
            imgHeightList.push(Math.ceil((imgWidth / img.width) * img.height));
            div.style.top = 0 + "px";
            div.style.left = (imgWidth + 22) * imgLoadIndex + "px";
            imgLoadIndex++;
          } else {
            var minIndex = imgHeightList.indexOf(
              Math.min.apply(null, imgHeightList)
            );
            div.style.top = imgHeightList[minIndex] + 22 + "px";
            div.style.left = (imgWidth + 22) * minIndex + "px";
            imgHeightList[minIndex] +=
              Math.ceil((imgWidth / img.width) * img.height) + 22;
          }
          img.width = 200;
          this.$refs.dirImgBox.style.height = Math.max.apply(null, imgHeightList) + 22 + "px";
          div.appendChild(img);
          this.imgList.push(div);
          this.$refs.dirImgBox.appendChild(div);
        };
      });
    },
  },
};
</script>
<style lang="scss">
.view {
  width: 100%;
  
  .main {
    width: 250px;
    // height: 500px;
    position: relative;
    background: radial-gradient(#fff, #f1c000 , #bad);
    display: grid;
    grid-template-areas: "top top top" "left right right"  "left right right" ;
    grid-template-columns: 50px 100px 100px;
    grid-template-rows: 50px 100px 100px;
    .top {
      grid-area: top;
      // line-height: 50px;
      font-size: 16px;
      color: aqua;
      background: #cad;
      line-height: 50px;
      &::before {
         content: '';
        vertical-align: middle;
        display: inline-block;
        width: 50px;
        height: 50px;
        background: #cba;
        border-radius: 50%;
      }
    }
    .left {
      grid-area: left;
      background: #cba;
      input {
        width: 100%;
        font-size: 24px;
        color: #bad;
      }
    }
    .right {
      grid-area: right;
      background: url("~@img/29.jpg") no-repeat right 0 / 100px,
        url(~@img/08.jpg) no-repeat right 0 / 100px;
      justify-content: center;
      align-items: center;
      img {
        // height: 100%;
        width: 100px;
      }
    }
  }
  input[type="file"] {
    display: none;
  }
  #dirImgBox {
    width: 100%;
    position: relative;
    height: 172px;
    div {
    }

    img {
      display: block;
    }
    &::after {
      content: "";
      display: block;
      clear: both;
    }
    > div {
      transition: all 1s;
      position: absolute;
      float: left;
      margin: 5px;
      width: 100px;
      height: 150px;
      padding: 5px;
      border: 1px dashed #f1c000;
      color: #b7b7b7;
      text-align: center;
      margin: 10px 0;
      i {
        display: inline-block;
        font-size: 70px;
        line-height: 150px;
        margin: 0 auto;
        font-style: normal;
      }
      &.hasImg i {
        display: none;
      }
    }
  }

  //   #fileBox,
  //   #dirImgBox div {
  //     width: 100px;
  //     height: 150px;
  //     padding: 5px;
  //     border: 1px dashed #f1c000;
  //     color: #b7b7b7;
  //     text-align: center;
  //     margin: 10px 0;
  //   }

  //   #fileBox i,
  //   #dirFileBox i {
  //     display: inline-block;
  //     font-size: 70px;
  //     line-height: 150px;
  //     margin: 0 auto;
  //     font-style: normal;
  //   }

  //   #fileBox.hasImg i,
  //   #dirFileBox.hasImg i {
  //     display: none;
  //   }

}
</style>