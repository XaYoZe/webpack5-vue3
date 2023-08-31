<template>
  <div class="list_scroll"
   @touchmove.stop="touchmove" @touchstart="touchstart" @touchend="touchsend"
  >
    <div class="list_content" ref="listEl"
    :style="{
      '--scale': scale,
      '--time': `${this.time}s`,
      '--radius': radius,
      '--opacity': opacity,
    }"
     :class="[position, toVw, { play, front, reverse }]">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      play: false, // 播放
      time: 10, // 週期時長
      activeName: 'active', // 選中元素類名
      position: '', // 定位
      reverse: false, // 轉動方向
      listEl: null, 
      listItems: [],
      toVw: false,
      offsetTime: 0,
      prevX: 0
    }
  },
  computed: {
    num () {
      return this.list.length
    }
  },
  props: {
    sleep: {
      type: Number,
      default: 0
    }, // 中間停留時間
    list: {},
    // 縮放
    scale: {
      type: Number,
      default: 1
    },
    // 透明度
    opacity: {
      type: Number,
      default: 1
    },
     // 旋轉半徑
    radius: {
      type: Number,
      default: 200
    },
    // 正面朝前
    front: {
      type: Boolean,
      default: false
    }, 
  },
  methods: {
    // 按下
    touchstart (e) {
      console.log(e)
      this.prevX = e.changedTouches[0].clientX
      this.play = false
      // this.offsetTime += 9;
    },
    // 彈起
    touchsend (e) {
      this.prevX = e.changedTouches[0].clientX
      this.play = true
    },
    // 拖動
    touchmove (e) {
      let perimeter = Math.PI * Math.pow(this.radius, 2)
      let rl = (perimeter / 2) / this.radius * 2 / this.list.length;
      // 拖動的角度
      let moveDeg = (((e.changedTouches[0].clientX - this.prevX) * rl) / perimeter) * 360;
      // 角度轉時間
      let timeDeg = this.time / 360 * moveDeg;
      this.offsetTime -= timeDeg;
      this.prevX = e.changedTouches[0].clientX
      this.initEl();
    },
    // 動畫
    animationiteration(e) {
      if (this.sleep > 0) {
        this.play = false;
        e.target.classList.add(this.activeName);
        this.$emit('active', e.target.dataset.id);
        setTimeout(() => {
          e.target.classList.remove(this.activeName);
          this.play = true;
        }, this.sleep);
      }
    },
    initEl () {
      // console.log(this.list);
      Array.from(this.listItems, (item, i) => {
        item.style.setProperty('--delay', `-${(this.time - (i * this.time) / this.num) + (this.num * 100000) + this.offsetTime}s`);
        item.removeEventListener('animationiteration', this.animationiteration, this);
        item.addEventListener('animationiteration', this.animationiteration, this);
        item.dataset.id = i
      })
    }
  },
  mounted () {
    this.play = true; 
  },
  watch: {
    list:{
      handler  () {
        if (this.list.length > 0) {
          this.$nextTick(() => {
            this.listEl = this.$refs.list;
            this.listItems = this.listEl.children;
            this.initEl()
          })
        }
      },
      immediate: true
    }
  }
};
</script>

<style lang="scss" scoped>
.list_scroll {
  position: relative;
  height: 100%;
  width: 100%;
  .list_content {
    --time: 20s;
    --delay: 10s;
    --transfromX: -50%;
    --transfromY: -50%;
    --radius: -200px; // 旋轉半徑
    --opacity: 0.8; // 背后元素透明度
    $opacity: var(--opacity); // 旋轉半徑
    $radius: var(--radius); // 旋轉半徑
    $rotateZ: calc(0 / 360);
    $rotateY: calc(360 / 360);
    $rotateX: calc(0 / 360);
    $scale: var(--scale); // 縮小程度
    $time: var(--time); // 時間
    $delay: var(--delay); // 延時
    $transfromY: var(--transfromY); 
    $transfromX: var(--transfromX);

    $transfromZ1: calc($radius * -1); 
    $transfromZ2: calc($radius);
    &.toVw {
      $transfromZ1: calc($radius / 750 * 100vw * -1); 
      $transfromZ2: calc($radius / 750 * 100vw);
    }
    @keyframes default {
      0% {
         transform: translate3d($transfromX, $transfromY, $transfromZ1) rotate3d($rotateX, $rotateY, $rotateZ, 360deg) translate3d(0, 0, $transfromZ2) scale3d(1, 1, 1);
         opacity: 1;
      }
      50% {
        opacity: $opacity;
        transform: translate3d($transfromX, $transfromY, $transfromZ1) rotate3d($rotateX, $rotateY, $rotateZ, 180deg) translate3d(0, 0, $transfromZ2) scale3d($scale, $scale, 1);
      }
      100% {
        transform: translate3d($transfromX, $transfromY, $transfromZ1) rotate3d($rotateX, $rotateY, $rotateZ, 0) translate3d(0, 0, $transfromZ2) scale3d(1, 1, 1);
         opacity: 1;
      }
    }

    @keyframes front {
      0% {
        transform: translate3d($transfromX, $transfromY, $transfromZ1) rotate3d($rotateX, $rotateY, $rotateZ, 360deg) translate3d(0, 0, $transfromZ2)  rotate3d($rotateX, $rotateY, $rotateZ, 0) scale3d(1, 1, 1);
         opacity: 1;
      }
      50% {
        transform: translate3d($transfromX, $transfromY, $transfromZ1) rotate3d($rotateX, $rotateY, $rotateZ, 180deg) translate3d(0, 0, $transfromZ2) rotate3d($rotateX, $rotateY, $rotateZ, 180deg) scale3d($scale, $scale, 1);
        opacity: $opacity;
      }
      100% {
        transform: translate3d($transfromX, $transfromY, $transfromZ1) rotate3d($rotateX, $rotateY, $rotateZ, 0)  translate3d(0, 0, $transfromZ2) rotate3d($rotateX, $rotateY, $rotateZ, 360deg) scale3d(1, 1, 1);
         opacity: 1;
      }
    }
    width: 100%;
    height: 100%;
    perspective: 10000px;
    perspective-origin: center center;
    position: relative;
    transform-style: preserve-3d;
    // 用來定位滾動位置
    $x: ('left', 'right');
    $y: ('top', 'bottom');
    $p: (0%, 100%);
    @for $xi from 1 through length($x) {
      &.#{nth($x, $xi)} {
        -webkit-perspective-origin-x: #{nth($x, $xi)};
        -ms-perspective-origin-x: #{nth($x, $xi)};
        --transfromX: -#{nth($p, $xi)};
        > * {
          left: #{nth($p, $xi)};
        }
      }
    }
    @for $yi from 1 through length($y) {
      &.#{nth($y, $yi)} {
        -webkit-perspective-origin-y: #{nth($y, $yi)};
        -ms-perspective-origin-y: #{nth($y, $yi)};
        --transfromY: -#{nth($p, $yi)};
        > * {
          top: #{nth($p, $yi)};
        }
      }
    }
    &:deep(> *) {
        position: absolute;
        left: 50%;
        top: 50%;
        animation: $time linear $delay infinite normal paused default;
        transition: all 1s;
    }
    &.play :deep(> *) {
      animation-play-state: running;
    }
    &.reverse :deep(> *) {
      animation-direction: reverse;
    }
    &.front :deep(> *) {
      animation-name: front;
    }
  }
}
</style>
