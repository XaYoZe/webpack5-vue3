<template>
  <div class="turn_table" :style="turnTableStyle">
    <div
      class="turn_table_list"
      ref="turnTableListEl"
      :class="[{ transition: !disableTranstion, front }]"
      :style="degStyle"
      @click="turnTableItemClick"
      @touchstart="touchstartEvent"
      @touchmove="touchmoveEvent"
      @touchend="touchendEvent"

      @mousedown="touchstartEvent"
      @mousemove="touchmoveEvent"
      @mouseup="touchendEvent"
      @mouseleave="touchendEvent"
    >
      <slot></slot>
    </div>
    <div class="turn_table_center" v-if="$slots.center">
      <slot name="center"></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted, reactive, watch, nextTick, defineSlots, defineModel, onUpdated } from 'vue'


const $slots = defineSlots()
const $emits = defineEmits({
  change: (index: number) => true,
})

type AutoPlay = boolean | number | {
  /** 自动旋转, 毫秒, 可负值 */
  duration?: number
  /** 停留时间, 毫秒 */
  stayTime?: number
}

const $props = withDefaults(
  defineProps<{
    /** 縮放效果, 从前往后缩放 */
    scale?: string | number
    /** 透明度, 从前往后透明 */
    opacity?: string | number
    /** 旋轉半徑, 像素 */
    radius?: string | number
    /** 正面朝前 */
    front?: boolean
    /** 傾斜角度, 角度 */
    rotateX?: string | number
    /** 过渡時長, 毫秒 */
    duration?: string | number
    /** 自动旋转, 毫秒, 可负值 */
    autoplay?: AutoPlay
    /** 上下偏移, 像素 */
    offsetY?: string | number
    /** 初始化索引 */
    initIndex?: number
    /** 设计宽度 */
    designWidth?: number
    /** 选中时样式名 */
    selectClassName: string
    click: boolean,
    draggable: boolean
  }>(),
  {
    // 縮放
    scale: 1,
    // 透明度
    opacity: 1,
    // 旋轉半徑
    radius: 375,
    // 正面朝前
    front: false,
    // 傾斜角度
    rotateX: 0,
    /** 過度時長 */
    duration: 300,
    /** 上下偏移 */
    offsetY: 0,
    /** 初始化索引 */
    initIndex: 0,
    /** 设计宽度 */
    designWidth: 750,
    /** 选中时样式名 */
    selectClassName: 'turn_table_item_active',
    /** 可点击 */
    click: false,
    /** 可拖拽 */
    draggable: false
  }
)
// 宽度转换
const toCurPX = (num: number) => {
  if (!$props.designWidth) return num
  return (num / ($props.designWidth / 100)) * (window.innerWidth / 100)
}
// slot 列表
const turnTableList = ref<HTMLDivElement[]>([])
// 容器元素
const turnTableListEl = ref(null)
// 當前索引
const curIndex = ref($props.initIndex)
// 轉動基礎角度
const baseDeg = ref(0)
// 當前角度
const curDeg = ref(curIndex.value * baseDeg.value * -1)
// 禁用transtion
const disableTranstion = ref(false)
// 是否初始化完畢
const ininted = ref(false)
// 滾動到指定索引
const turnTableItem = (index: number, anime = true) => {
  disableTranstion.value = !anime
  nextTick(() => {
    const elItem = turnTableList.value[index]
    const curDegVal = (Number(elItem.dataset?.baseDeg) + curDeg.value) % 360
    if (curDegVal > 180) {
      curDeg.value += 360 - curDegVal
    } else {
      if (curDegVal < -180) {
        curDeg.value -= 360 + curDegVal
      } else {
        curDeg.value -= curDegVal
      }
    }
    curIndex.value = index
    resetDeg()
  })
}

let remainderDegTimer:ReturnType<typeof setTimeout> = null
// 重新計算角度
const resetDeg = () => {
  clearTimeout(remainderDegTimer)
  remainderDegTimer = setTimeout(() => {
    disableTranstion.value = true
    curDeg.value = curDeg.value % 360
  }, Number($props.duration))
}

// 點擊轉盤元素
const turnTableItemClick = (event: MouseEvent & { target: HTMLDivElement }) => {
  if (!$props.click) return
  if (event.target === turnTableListEl.value) return
  let index = -1
  turnTableList.value.some((item, i) => {
    if (item.contains(event.target)) {
      index = i
      return true
    }
  })
  if (index === -1) return
  // const index = turnTableList.value.indexOf(event.target)
  turnTableItem(index)
  // event.preventDefault()
  // event.stopPropagation()
}

// 拖動x坐標
let prevScreenX = 0
// 拖動距離
let moveValue = 0
// 拖動限制
let moveLimit = {
  touchX: 0,
  touchY: 0,
  moveX: 0,
  moveY: 0,
  isMove: false,
  isStart: false
}
// 按下事件
const touchstartEvent = (event: TouchEvent & MouseEvent) => {
  if (!$props.draggable) return
  let touchItem = event.touches?.length ? event.touches[0] : {screenX:event.screenX, screenY: screenY}
  prevScreenX = touchItem.screenX
  moveLimit.touchX = touchItem.screenX
  moveLimit.touchY = touchItem.screenY
  moveLimit.moveX = 0
  moveLimit.moveY = 0
  moveLimit.isStart = true;
  startAutoPlay(false)
}
// 拖動事件
const touchmoveEvent = (event: TouchEvent & MouseEvent) => {
  if (!moveLimit.isStart || !$props.draggable) return;
  let touchItem = event.touches?.length ? event.touches[0] : {screenX:event.screenX, screenY: screenY}
  // 計算移動距離
  moveLimit.moveX = touchItem.screenX - moveLimit.touchX
  moveLimit.moveY = touchItem.screenY - moveLimit.touchY
  // 判斷是否為拖動
  if (!moveLimit.isMove) {
    if (moveLimit.moveX >= 0 && moveLimit.moveX < Math.abs(moveLimit.moveY)) {
      return
    } else if (moveLimit.moveX < 0 && Math.abs(moveLimit.moveX) < Math.abs(moveLimit.moveY)) {
      return
    }
  }
  // 正在拖動
  moveLimit.isMove = true
  disableTranstion.value = true
  curIndex.value = -1
  if (prevScreenX === 0) {
    moveValue = 0
  } else {
    moveValue = touchItem.screenX - prevScreenX
    curDeg.value += (180 / toCurPX(Number($props.radius) * 2)) * moveValue
  }
  prevScreenX = touchItem.screenX
  if (event.cancelable) {
    event.preventDefault()
  }
  // event.stopPropagation()
}
// 彈起事件
const touchendEvent = () => {
  if (!moveLimit.isStart || !$props.draggable) return;
  moveLimit.isStart = false
  if (moveLimit.isMove) {
    moveLimit.isMove = false
    disableTranstion.value = false
    prevScreenX = 0
    moveValue = 0
    let index = 0
    nextTick(() => {
      // 根據當前角度判斷
      if (curDeg.value < 0) {
        // 限制邏輯
        // if (Math.abs(curDeg.value) >= (turnTableList.value.length - 1) * baseDeg.value) {
        //   curDeg.value = (turnTableList.value.length - 1) * baseDeg.value * -1
        // } else
        if (Math.abs(curDeg.value % baseDeg.value) <= baseDeg.value / 2) {
          curDeg.value += Math.abs(curDeg.value % baseDeg.value)
        } else {
          curDeg.value -= baseDeg.value - Math.abs(curDeg.value % baseDeg.value)
        }
        index = Math.abs((curDeg.value % 360) / baseDeg.value)
      } else {
        // 限制邏輯
        // if (Math.abs(curDeg.value) > 0) {
        // curDeg.value = 0
        // } else if (curDeg.value >= turnTableList.value.length * baseDeg.value) {
        //   curDeg.value = turnTableList.value.length * baseDeg.value
        // } else {
        if (Math.abs(curDeg.value % baseDeg.value) <= baseDeg.value / 2) {
          curDeg.value -= Math.abs(curDeg.value % baseDeg.value)
        } else {
          curDeg.value += baseDeg.value - Math.abs(curDeg.value % baseDeg.value)
        }
        // }
        index = curDeg.value === 0 ? 0 : 360 / baseDeg.value - Math.abs((curDeg.value % 360) / baseDeg.value)
      }
      /** 處理精度問題 */
      curIndex.value = Math.round(index)
      startAutoPlay()
    })
  }
}

// 自動播放
let countTime = 0
const autoplay = computed(() => {
  let obj:AutoPlay = {
    duration: 0,
    stayTime: 0
  }
  if (typeof $props.autoplay === 'boolean') {
    obj = {
      duration: 10000,
      stayTime: 0
    }
  } else if (typeof $props.autoplay === 'number') {
    obj = {
      duration: $props.autoplay,
      stayTime: 0
    }
  } else if (typeof $props.autoplay === 'object') {
    return $props.autoplay
  }
  return obj
})
const fps = 60
const fpsTime = 1000 / fps
const degFps = computed(() => (360 / (autoplay.value.duration)) * fpsTime)
let autoplayFrame:number = null
let autoplayTimer:ReturnType<typeof setTimeout> = null

const startAutoPlay = (flag = true) => {
  if ($props.autoplay) {
    if (flag) {
      autoplayTimer = setTimeout(() => {
        autoplayFrame = requestAnimationFrame(autoPlayEvent)
      }, 1000)
    } else {
      clearTimeout(autoplayTimer)
      cancelAnimationFrame(autoplayFrame)
      // autoplayFrame =  requestAnimationFrame(autoPlayEvent)
    }
  }
}
// 自動播放事件
const autoPlayEvent: FrameRequestCallback = (time: DOMHighResTimeStamp) => {
  disableTranstion.value = true
  const delta = time - countTime
  if (delta >= fpsTime) {
    curDeg.value = Number(((curDeg.value - degFps.value) % 360).toFixed(2))
    
    countTime = time - (delta % fpsTime)
    let degVal = Math.abs(Number((curDeg.value / baseDeg.value).toFixed(2)))
    if (degVal % 1 <= 1) {
      let index = Math.round(degVal)
      let maxIndex = 360 / baseDeg.value - 1
      curIndex.value = index > maxIndex ? 0 : index
      // console.log((curDeg.value / baseDeg.value).toFixed(2), curIndex.value, baseDeg.value);
    } else {
      curIndex.value = -1;
    }

    // if (Math.abs((curDeg.value) % baseDeg.value) >= 1 && Math.abs((curDeg.value) % baseDeg.value) <= (baseDeg.value - 1)) {
    // } else {
    // }
  }
  autoplayFrame = requestAnimationFrame(autoPlayEvent)
}

/** 转盘基础样式 */
const turnTableStyle = computed(() => {
  let radius = toCurPX(Number($props.radius))
  let totalHeight = radius
  let elementHeight = Number(turnTableList.value[0]?.dataset?.height || 0)
  let elementWidth = Number(turnTableList.value[0]?.dataset?.width || 0)
  // 使用角度比例计算高度
  let rotateRad = Math.abs((Number($props.rotateX) * Math.PI) / 180)
  let scaleY = ((1 - Number($props.scale)) * elementHeight) / 2
  let offsetY = toCurPX(Number($props.offsetY))
  if ($props.front) {
    totalHeight = elementHeight * (1 - Math.sin(rotateRad)) + 2 * (radius + (elementHeight - elementWidth) / 2) * Math.sin(rotateRad) + offsetY - scaleY
  } else {
    totalHeight = elementHeight * (1 - Math.sin(rotateRad)) + (2 * radius + elementHeight) * Math.sin(rotateRad) + offsetY - scaleY
  }

  return {
    '--height': `${totalHeight}px`,
    '--width': `${radius * 2}px`,
    '--scale': $props.scale,
    '--radius': `${radius}px`,
    '--opacity': $props.opacity,
    '--rotateX': `${$props.rotateX}deg`,
    '--duration': `${$props.duration}ms`,
    '--offsetY': `${offsetY}px`,
    '--scaleY': `${scaleY / -2}px`,
  }
})
/** 角度樣式 */
const degStyle = ref<Record<string, any>>({})
/** 監聽角度變化 */
watch(curDeg, () => {
  degStyle.value['--deg'] = `${curDeg.value}deg`
  degStyle.value['--degVal'] = `${curDeg.value <= 0 ? Math.abs(curDeg.value % 360) : 360 - (curDeg.value % 360)}`
}, {immediate: true})


/** 監聽索引變化 */
watch(
  [curIndex, turnTableListEl],
  ([index, el]) => {
    if (el) {
      let oldEl = el.querySelector(`.${$props.selectClassName}`)
      let newEl = el.children[index];
      if (oldEl) {
        oldEl.classList.remove($props.selectClassName)
      }
      if (newEl) {
        newEl.classList.add($props.selectClassName)
      }
      // list.map((item, i) => {
      //   if (i === index) {
      //     item.classList.add('active')
      //   } else {
      //     item.classList.remove('active')
      //   }
      // })
      if (index > -1) {
        $emits('change', index)
      }
    }
  },
  { immediate: true }
)

/** 初始化 */
function initEl() {
  disableTranstion.value = true
  turnTableList.value = Array.from(turnTableListEl.value.children)
  curIndex.value = $props.initIndex
  baseDeg.value = 360 / turnTableList.value.length
  curDeg.value = curIndex.value * baseDeg.value * -1
  turnTableList.value.forEach((item: HTMLDivElement, i) => {
    let box = item.getBoundingClientRect()
    let deg = i * baseDeg.value
    item.dataset.baseDeg = String(deg)
    item.dataset.height = String(box.height)
    item.dataset.width = String(box.width)
    item.style.setProperty('--baseDeg', `${deg}deg`)
    item.style.setProperty('--width', `${toCurPX(Number($props.radius)) - box.width / 2}px`)
    item.style.setProperty('--baseDegVal', `${deg}`)
  })
  /** 初始化樣式 */
  // initStyle()
  nextTick(() => {
    disableTranstion.value = true
    if (turnTableList.value.length) {
      ininted.value = true
    }
    startAutoPlay()
  })
}

/** 監聽插槽變化 */
watch(
  () => $slots.default?.(),
  (val) => {
    // 長度不變不初始化
      let children = val?.[0]?.children;
    if (turnTableList.value?.length === children.length) {
      return
    }
    nextTick(() => {
      initEl()
    })
  },
  { immediate: true }
)

const turnNext = (anime = true) => {
  let index = curIndex.value + 1
  if (index >= turnTableList.value.length) {
    index = 0
  }
  turnTableItem(index, anime)
}

const turnPrev = (anime = true) => {
  let index = curIndex.value - 1
  if (index <= 0) {
    index = turnTableList.value.length - 1
  }
  turnTableItem(index, anime)
}

const trunToIndex = (index: number, anime = true) => {
  if (ininted.value) {
    if (index < 0 || index >= turnTableList.value.length) return false
    turnTableItem(index, anime)
  } else {
    let watchCb = watch(ininted, (val) => {
      if (val) {
        if (index < 0 || index >= turnTableList.value.length) return false
        turnTableItem(index, anime)
        watchCb()
      }
    })
  }
}

defineExpose({
  initEl,
  turnNext,
  turnPrev,
  trunToIndex,
})
</script>
<style lang="scss">
.turn_table {
  position: relative;
  transform-style: preserve-3d;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  // width: var(--width);
  // height: var(--height);
  .turn_table_list {
    &.transition > * {
      transition: all var(--duration);
    }
    transform-style: preserve-3d;
    // perspective: var(--perspective, none);
    perspective-origin: center center;
    width: var(--width);
    height: var(--height);
    > *:not(.turn_table_center) {
      --degAbs: max(calc(var(--baseDegVal) - var(--degVal)), calc(var(--degVal) - var(--baseDegVal)));
      --dRing: min(var(--degAbs), 360 - var(--degAbs));
      --offsetZ: calc(1 - var(--dRing) / 180);
      opacity: calc(var(--opacity) + ((1 - var(--opacity)) * var(--offsetZ)));
      position: absolute;
      top: 50%;
      left: 50%;
      /** 中心向外 */

      transform: translate3d(-50%, calc(var(--offsetY) * (var(--offsetZ) - 0.5) + -50% + var(--scaleY)), calc(var(--radius) * 2)) rotateX(var(--rotateX)) rotateY(calc(var(--deg) + var(--baseDeg)))
        translate3d(0, 0, var(--radius)) rotateY(calc((var(--deg) + var(--baseDeg)) * -1)) rotateX(calc(var(--rotateX) * -1)) rotateY(calc(var(--deg) + var(--baseDeg)))
        scale(calc(var(--scale) + ((1 - var(--scale)) * var(--offsetZ))));
    }
    &.front {
      > *:not(.turn_table_center) {
        /** 面向前方 */
        transform: translate3d(-50%, calc(var(--offsetY) * (var(--offsetZ) - 0.5) + -50% + var(--scaleY)), 0) rotateX(var(--rotateX)) rotateY(calc(var(--deg) + var(--baseDeg)))
          translate3d(0, 0, var(--width)) rotateY(calc((var(--deg) + var(--baseDeg)) * -1)) rotateX(calc(var(--rotateX) * -1)) scale(calc(var(--scale) + ((1 - var(--scale)) * var(--offsetZ))))
          translate3d(0, 0, calc(var(--radius) * 2));
      }
    }
  }
  .turn_table_center {
    position: absolute;
    // top: 50%;
    // left: 50%;
    // transform: translate3d(-50%, -50%, 0);
    transform: translate3d(0, 0, calc(var(--radius) * 2));
  }
}
</style>
