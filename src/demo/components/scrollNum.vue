
<!-- 数字滚轮 -->
<!-- 注释写在template下第一行会影响$el获取的元素 -->
<template>
  <div
    :class="['scroll-container', { autoTurn: isRunning }]"
    :style="{ width: `${toCurPX(config.width)}vw` }"
    @transitionend="transitionend"
  >
    <div
      :class="['scroll-item', config.style]"
      v-for="(item, index) in config.items"
      :key="index"
      :style="`transform: rotateX(${rotate * index}deg) translateZ(${toCurPX(
        translateZ
      )}vw)`"
      :data-id="item.name"
    >
      <template v-if="item.type === 'text'">{{ item.text }}</template>
      <template v-if="item.type === 'image'">
        <img :src="item.path" />
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "scrollNum",
  props: {
    length: {
      // 数值位数
      type: Number,
      default: 0,
    },
    index: {
      // 数值位数索引
      type: Number,
      default: 0,
    },
    select: {
      // 開獎索引, 不傳隨機
      type: Number,
      default: -1,
    },
    config: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isRunning: false,
      currentDeg: 0,
      targetDeg: 0,
      giftsDeg: [],
      oldNum: 0,
    };
  },
  computed: {
    // 每格角度
    rotate() {
      return 360 / this.config.items.length;
    },
    // 半径
    translateZ() {
      return (
         this.config.height / 2 / Math.tan((this.rotate / 2 / 180) * Math.PI)
      );
    },
    // 选中的索引
    selectIndex() {
      let selectIndex = -1;
      let selectStr = String(this.select);
      while (selectStr.length < this.length) {
        selectStr = "0" + selectStr;
      }
      let showNum = selectStr[this.index];
      this.config.items &&
        this.config.items.forEach((item, index) => {
          if (Number(index) === Number(showNum)) {
            selectIndex = index;
          }
        });
      return selectIndex;
    },
    // 转多少圈
    turnCount() {
      let newNum = String(this.select);
      let oldNum = String(this.oldNum);
      while (newNum.length < this.length) {
        newNum = "0" + newNum;
      }
      while (oldNum.length < newNum.length) {
        oldNum = "0" + oldNum;
      }
      return Number(newNum.slice(0, this.index)) - Number(oldNum.slice(0, this.index));
    },
  },
  watch: {
    config: {
      handler() {
        // this.setConfig();
      },
      deep: true,
    },
    select: {
      handler() {
        this.$nextTick(() => {
          this.autoTurn();
        });
      },
      deep: true,
      immediate: true,
    },
    isRunning() {
      if (this.isRunning) {
      }
    },
  },
  mounted() {
    this.setConfig();
    this.logGiftsDeg();
  },
  methods: {
      // css transition动画结束触发
    transitionend() {
      setTimeout(() => {
        this.autoTurnStop();
      }, 200);
    },
    toCurPX(px) {
      // 轉換px為基於寬度750屏幕的vw
      return ((100 / window.innerWidth) * ((px / (750 / 100)) * (window.innerWidth / 100)));
    },
    logGiftsDeg() {
      // 紀錄獎品角度
      this.config.items.forEach((gift, index) => {
        this.giftsDeg[index] = {
          from: index === 0 ? 0 : this.giftsDeg[index - 1].to,
          to:
            index === 0
              ? this.rotate
              : this.giftsDeg[index - 1].to + this.rotate,
          name: gift.name,
        };
      });
    },
    setConfig() {
      // 將config的變數們寫入CSS變數中
      this.$el.style.setProperty("--rotateY", `${this.config.rotateY}deg`);
      this.$el.style.setProperty("--duration", `${this.config.duration}ms`);
      this.$el.style.setProperty("--fontSize", `${this.toCurPX(this.config.fontSize)}vw`);
      this.$el.style.setProperty("--height", `${this.toCurPX(this.config.height)}vw`);
      this.$el.style.setProperty("--width", `${this.toCurPX(this.config.width)}vw`);
      this.$el.style.setProperty("--currentDeg", `-${this.currentDeg}deg`);
    },
    autoTurn() {
      // 计算转动角度
      let deg = this.rotate * this.selectIndex + 360 * this.turnCount;
      // 減去餘數，避免有高低不一的狀況
      this.targetDeg = deg - deg % this.rotate;
      this.$el.style.setProperty("--targetDeg", `-${this.targetDeg}deg`);
      // 執行轉動
      this.isRunning = true;
    },
    autoTurnStop() {
      // 把結束時的角度設定為當前角度
      this.currentDeg = this.targetDeg % 360;
      this.$el.style.setProperty("--currentDeg", `-${this.currentDeg}deg`);
      // 顯示獎品資料(結束角度 + 單片角度/2)
      let giftName = null;
      const endDeg = this.currentDeg + this.rotate / 2;
      this.giftsDeg.forEach((item, index) => {
        if (endDeg >= item.from && endDeg <= item.to) {
          giftName = item.name;
        }
      });
      // 宣告轉動結束
      this.isRunning = false;
      this.oldNum = this.select;
      this.$emit("finished", giftName); // 告訴上層已經轉完
    },
  },
};
</script>

<style lang="scss" scoped>
.scroll-container {
  /* 變數區 START */
  $width: var(--width);
  $height: var(--height);
  $fontSize: var(--fontSize);
  //
  $duration: var(--duration);
  $rotateY: var(--rotateY);
  $targetDeg: var(--targetDeg);
  $currentDeg: var(--currentDeg);
  /* 變數區 END*/
  * {
    box-sizing: border-box;
  }
  perspective: 999999px;
  user-select: none;
  position: relative;
  display: flex;
  align-items: center;
  // margin-right: $width;
  transform-style: preserve-3d;
  width: $width;
  height: $height;
  .scroll-item {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: $width;
    height: $height;
    border: 1px solid #333;
    background-color: #fff;
    box-sizing: border-box;
    font-size: $fontSize;
    img {
      // padding: 1px;
      width: 100%;
    }
  }

  transform:  rotateX($currentDeg);
  &.autoTurn {
    transition: $duration ease-in-out;
    transform:  rotateX($targetDeg);
  }
}
</style>
