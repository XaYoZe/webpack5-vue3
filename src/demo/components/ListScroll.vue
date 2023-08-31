<template>
  <div class="list_scroll"
   @touchmove.stop="touchmove" @touchstart="touchstart" @touchend="touchend"
  >
    <div class="list_content" ref="listEl"
    :style="{
      '--scale': scale,
      '--time': `${this.time}s`,
      '--radius': radius,
      '--opacity': opacity,
    }"
     :class="[position, toVw, { play, front, reverse, hideBackface}]">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, defineProps, computed, reactive, onMounted, Ref } from 'vue'

const emit = defineEmits(['active'])

const props = defineProps({
  // 縮放
  scale: {
    type: Number,
    default: 1
  },
  // 中间停留时间
  sleep: {
    type: Number,
    default: 0
  },
  // 列表，监听列表变化
  list: {
    default: Array(0)
  },
  // 透明度
  opacity: {
    type: Number,
    default: 1
  },
  // 正面朝前
  front: {
    type: Boolean,
    default: false
  },
  // 半径
  radius: {
    type: Number,
    default: 100
  },
  // 定位
  position: {
    type: String,
    default: 'center center'
  },
  // 反向旋转
  reverse: {
    type: Boolean,
    default: false
  },
  // 中间停留类名
  activeName: {
    type: String,
    default: 'active'
  },
  // 週期時長秒
  time: {
    type: Number,
    default: 10
  },
  // 是否自适应屏幕
  toVw: {
    type: Boolean,
    default: false
  },
  hideBackface: {
    type: Boolean,
    default: false
  }
})

// 列表元素
let listEl = ref(null);
// 储存列表项
let listItems = reactive([]);
// 列表长度
let listLength = computed(() => props.list.length);
// 播放
let play = ref(false);
// 拖动偏移时长
let offsetTime = ref(0);
// 拖动偏移量
let prevX = ref(0);

// 動畫事件
let animationiteration = (e) => {
   if (props.sleep > 0) {
     play.value = false;
     e.target.classList.add(props.activeName);
     emit('active', e.target.dataset.id);
     setTimeout(() => {
       e.target.classList.remove(props.activeName);
       play.value = true;
     }, props.sleep);
   }
 }
// 列表渲染
const initEl = () => {
  Array.from(listItems, (item, i) => {
    // item.style.setProperty('--delay', `-${(props.time - (i * props.time) / listLength.value) + (listLength.value * 100000) + offsetTime.value}s`);
    item.style.setProperty('--delay', `-${props.time * (1 - i / listLength.value) + listLength.value * 100000 + offsetTime.value}s`);
    item.removeEventListener('animationiteration', animationiteration, this);
    item.addEventListener('animationiteration', animationiteration, this);
    item.dataset.id = i
  })
}
onMounted(() => {
  listItems = listEl.value.children
  initEl()
  play.value  = true;
  console.log(1111, listItems)
})

// 触碰屏幕
const touchstart = (e) => {
  prevX.value = e.changedTouches[0].clientX;
  play.value = false;
}
// 离开屏幕
const touchend = (e) => {
  prevX.value = e.changedTouches[0].clientX
  play.value = true
}
// 屏幕拖动
const touchmove = (e) => {
  let perimeter = Math.PI * Math.pow(props.radius, 2)
  let rl = (perimeter / 2) / props.radius * 2 / props.list.length;
  // 拖動的角度
  let moveDeg = (((e.changedTouches[0].clientX - prevX.value) * rl) / perimeter) * 360;
  // 角度轉時間
  let timeDeg =  props.time / 360 * moveDeg;
  offsetTime.value -= timeDeg;
  prevX.value = e.changedTouches[0].clientX
  initEl();
}

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
    $rotateZ: calc(30 / 360);
    $rotateY: calc(0 / 360);
    $rotateX: calc(0 / 360);
    $scale: var(--scale); // 縮小程度
    $time: var(--time); // 時間
    $delay: var(--delay); // 延時
    $transfromY: var(--transfromY); 
    $transfromX: var(--transfromX);

    $transfromZ1: calc($radius * -1px); 
    $transfromZ2: calc($radius * 1px);
    &.toVw {
      $transfromZ1: calc($radius / 750 * 100vw * -1); 
      $transfromZ2: calc($radius / 750 * 100vw);
    }
    @keyframes default {
      0% {
        opacity: 1;
        transform: translate3d($transfromX, $transfromY, $transfromZ1) rotate3d($rotateX, $rotateY, $rotateZ, 360deg) translate3d(0, 0, $transfromZ2) scale3d(1, 1, 1);
      }
      50% {
        opacity: $opacity;
        transform: translate3d($transfromX, $transfromY, $transfromZ1) rotate3d($rotateX, $rotateY, $rotateZ, 180deg) translate3d(0, 0, $transfromZ2) scale3d($scale, $scale, 1);
      }
      100% {
        opacity: 1;
        transform: translate3d($transfromX, $transfromY, $transfromZ1) rotate3d($rotateX, $rotateY, $rotateZ, 0)translate3d(0, 0, $transfromZ2) scale3d(1, 1, 1);
      }
    }
    @keyframes default {
      0% {
        opacity: 1;
        transform: translate3d($transfromX, calc($transfromY + $transfromZ1), 0) rotate3d($rotateX, $rotateY, $rotateZ, 360deg) translate3d(0, $transfromZ2,0 ) scale3d(1, 1, 1);
      }
      50% {
        opacity: $opacity;
        transform: translate3d($transfromX, calc($transfromY + $transfromZ1), 0) rotate3d($rotateX, $rotateY, $rotateZ, 180deg) translate3d(0, $transfromZ2,0 ) scale3d($scale, $scale, 1);
      }
      100% {
        opacity: 1;
        transform: translate3d($transfromX, calc($transfromY + $transfromZ1), 0) rotate3d($rotateX, $rotateY, $rotateZ, 0)translate3d(0, $transfromZ2,0 ) scale3d(1, 1, 1);
      }
    }

    @keyframes front {
      0% {
        transform: translate3d($transfromX, $transfromY, $transfromZ1) rotate3d($rotateX, $rotateY, $rotateZ, 360deg) translate3d(0, 0, $transfromZ2) rotate3d($rotateX, $rotateY, $rotateZ, 0) scale3d(1, 1, 1);
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
    // perspective: 10000px;
    perspective-origin: center center;
    position: relative;
    transform-style: preserve-3d;
    backface-visibility: hidden;
    // 用來定位滾動位置
    $x: ('left', 'right');
    $y: ('top', 'bottom');
    $p: (0%, 100%);
    @for $xi from 1 through length($x) {
      &.#{nth($x, $xi)} {
        -webkit-perspective-origin-x: #{nth($x, $xi)};
        -ms-perspective-origin-x: #{nth($x, $xi)};
        --transfromX: -#{nth($p, $xi)};
        :deep(> *) {
          left: #{nth($p, $xi)};
        }
      }
    }
    @for $yi from 1 through length($y) {
      &.#{nth($y, $yi)} {
        -webkit-perspective-origin-y: #{nth($y, $yi)};
        -ms-perspective-origin-y: #{nth($y, $yi)};
        --transfromY: -#{nth($p, $yi)};
        :deep(> *) {
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
    &.hideBackface :deep(> *) {
      backface-visibility: hidden;
    }
    
  }
}
</style>
