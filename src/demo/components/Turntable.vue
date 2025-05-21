<template>
  <div
    class="turntable"
    @touchstart="touchstartEvent"
    @touchmove="touchmoveEvent"
    @touchend="touchendEvent"
    @mousedown="touchstartEvent"
    @mousemove="touchmoveEvent"
    @mouseup="touchendEvent"
    @mouseleave="touchendEvent"
    :style="turnTableStyle"
  >
    <div class="turntable_list" ref="turnTableListEl" :class="[{ transition: !disableTranstion, front }]" :style="degStyle">
      <slot></slot>
    </div>
    <div class="turntable_center" v-if="$slots.center">
      <slot name="center"></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted, reactive, watch, nextTick, defineSlots, defineModel, onUpdated } from 'vue';

const $slots = defineSlots();
const $emits = defineEmits({
  change: (index: number) => true,
});

type Draggable = {
  /** 摩擦, 越小慣性越大, 默認0.1 */
  friction: number;
  /** 最小速度, 大於0, 默認0.1 */
  minVelocity: number;
  /** 拖動最大角度, 默認180 */
  widthDeg: number;
};

/** 自动播放对象 */
type AutoPlay = {
  /** 自动旋转, 毫秒, 可负值 */
  duration?: number;
  /** 停留时间, 毫秒 */
  stayTime?: number;
};
/** 透视对象 */
type Perspective = {
  /** 透视距离 */
  distance: number | string;
  /** 透视中心 */
  originY: string | number;
  /** 转轮z轴偏移 */
  offsetZ: number | string;
};

const $props = withDefaults(
  defineProps<{
    /** 縮放效果, 从前往后缩放 */
    scale?: string | number;
    /** 透明度, 从前往后透明 */
    opacity?: string | number;
    /** 旋轉半徑, 像素 */
    radius?: string | number;
    /** 正面朝前 */
    front?: boolean;
    /** 傾斜角度, 角度 */
    rotateX?: string | number;
    /** 过渡時長, 毫秒 */
    duration?: string | number;
    /** 自动旋转, 毫秒, 可负值 */
    autoplay?: AutoPlay | boolean | number;
    /** 上下偏移, 像素 */
    offsetY?: string | number;
    /** 初始化索引 */
    initIndex?: number;
    /** 设计宽度 */
    designWidth?: number;
    /** 选中时样式名 */
    selectClassName?: string;
    /** 透视距离 */
    perspective?: Perspective | number | false;
    /** 可点击 */
    click?: boolean;
    /** 可拖动 */
    draggable?: boolean | Draggable;
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
    selectClassName: 'turntable_item_active',
    /** 透视距离 */
    perspective: false,
    /** 可点击 */
    click: false,
    /** 可拖拽 */
    draggable: false,
  }
);
// 宽度转换
const toCurPX = (num: number) => {
  if (!$props.designWidth) return num;
  return (num / ($props.designWidth / 100)) * (window.innerWidth / 100);
};
// slot 列表
const turnTableList = ref<HTMLDivElement[]>([]);
// 容器元素
const turnTableListEl = ref<HTMLDivElement>(null);
// 當前索引
const curIndex = ref($props.initIndex);
// 轉動基礎角度
const baseDeg = ref(0);
// 當前角度
const curDeg = ref(curIndex.value * baseDeg.value * -1);
// 禁用transtion
const disableTranstion = ref(false);
// 是否初始化完畢
const ininted = ref(false);

let remainderDegTimer: ReturnType<typeof setTimeout> = null;
// 重新計算角度
const resetDeg = () => {
  clearTimeout(remainderDegTimer);
  remainderDegTimer = setTimeout(() => {
    disableTranstion.value = true;
    curDeg.value = curDeg.value % 360;
  }, Number($props.duration));
};
// 滾動到指定索引
const turnTableItem = (index: number, anime = true) => {
  disableTranstion.value = !anime;
  nextTick(() => {
    const elItem = turnTableList.value[index];
    const curDegVal = (Number(elItem.dataset?.baseDeg) + curDeg.value) % 360;
    if (curDegVal > 180) {
      curDeg.value += 360 - curDegVal;
    } else {
      if (curDegVal < -180) {
        curDeg.value -= 360 + curDegVal;
      } else {
        curDeg.value -= curDegVal;
      }
    }
    curIndex.value = index;
    resetDeg();
  });
};

// 點擊轉盤元素
let deboundClick = false;
let clickAutoPlayTime: ReturnType<typeof setTimeout> = null;
const turnTableItemClick = (event: MouseEvent & TouchEvent) => {
  if (!$props.click || moveData.isMove) return;
  if (event.target === turnTableListEl.value) return;
  if (deboundClick) return;
  deboundClick = true;
  setTimeout(() => {
    deboundClick = false;
  }, 200);
  startAutoPlay(false);
  let index = -1;
  turnTableList.value.some((item, i) => {
    if (item.contains(event.target as HTMLDivElement)) {
      index = i;
      return true;
    }
  });
  if (index === -1) return;
  // const index = turnTableList.value.indexOf(event.target)
  turnTableItem(index);
  clearTimeout(clickAutoPlayTime);
  clickAutoPlayTime = setTimeout(() => {
    startAutoPlay();
  }, Number($props.duration));
  // event.preventDefault()
  // event.stopPropagation()
};

//
//
// 拖動限制
let moveData = {
  touchX: 0,
  touchY: 0,
  moveX: 0,
  moveY: 0,
  /** 拖動x坐標 */
  prevScreenX: 0,
  /** 拖動距離 */
  moveValue: 0,
  isMove: false,
  isStart: false,
  /** X轴速度 */
  velocity: 0,
  moveTime: 0,
  lastTime: 0,
};

/** 拖動配置項 */
const draggable = computed(() => {
  let obj = {
    /** 是否可拖動 */
    draggable: false,
    /** 摩擦系数 */
    friction: 0.1,
    /** 最小速度 */
    minVelocity: 0.1,
    /** 移动距离 */
    widthDeg: 180,
  };
  if (typeof $props.draggable === 'boolean') {
    obj.draggable = $props.draggable;
  } else {
    obj = Object.assign(obj, $props.draggable);
  }
  return obj;
});

const snapToNearestIndex = () => {
  // const normalizedDeg = ((curDeg.value % 360) + 360) % 360
  // const targetIndex = Math.round(normalizedDeg / baseDeg.value) % turnTableList.value.length
  // turnTableItem(targetIndex)

  let index = 0;
  nextTick(() => {
    // 根據當前角度判斷
    if (curDeg.value < 0) {
      // 限制邏輯
      // if (Math.abs(curDeg.value) >= (turnTableList.value.length - 1) * baseDeg.value) {
      //   curDeg.value = (turnTableList.value.length - 1) * baseDeg.value * -1
      // } else
      if (Math.abs(curDeg.value % baseDeg.value) <= baseDeg.value / 2) {
        curDeg.value += Math.abs(curDeg.value % baseDeg.value);
      } else {
        curDeg.value -= baseDeg.value - Math.abs(curDeg.value % baseDeg.value);
      }
      index = Math.abs((curDeg.value % 360) / baseDeg.value);
    } else {
      // 限制邏輯
      // if (Math.abs(curDeg.value) > 0) {
      // curDeg.value = 0
      // } else if (curDeg.value >= turnTableList.value.length * baseDeg.value) {
      //   curDeg.value = turnTableList.value.length * baseDeg.value
      // } else {
      if (Math.abs(curDeg.value % baseDeg.value) <= baseDeg.value / 2) {
        curDeg.value -= Math.abs(curDeg.value % baseDeg.value);
      } else {
        curDeg.value += baseDeg.value - Math.abs(curDeg.value % baseDeg.value);
      }
      // }
      index = curDeg.value === 0 ? 0 : 360 / baseDeg.value - Math.abs((curDeg.value % 360) / baseDeg.value);
    }
    /** 處理精度問題 */
    curIndex.value = Math.round(index % turnTableList.value.length);
    startAutoPlay();
  });
};

let prevAnimateInertiaTimer = 0;
const animateInertia = (timer: number = 0) => {
  if (timer - prevAnimateInertiaTimer >= moveData.moveTime) {
    if (Math.abs(moveData.velocity) > draggable.value.minVelocity) {
      curDeg.value += moveData.velocity;
      moveData.velocity *= 1 - draggable.value.friction;
    } else {
      snapToNearestIndex();
      return;
    }
  }
  requestAnimationFrame(animateInertia);
  prevAnimateInertiaTimer = timer;
};

// 按下事件
const touchstartEvent = (event: TouchEvent & MouseEvent) => {
  let touchItem = event.changedTouches?.length ? event.changedTouches[0] : { screenX: event.screenX, screenY: event.screenY };
  moveData.prevScreenX = touchItem.screenX;
  moveData.touchX = touchItem.screenX;
  moveData.touchY = touchItem.screenY;
  moveData.moveX = 0;
  moveData.moveY = 0;
  moveData.isStart = true;
  moveData.lastTime = Date.now();
};
// 拖動事件
const touchmoveEvent = (event: TouchEvent & MouseEvent) => {
  if (!moveData.isStart || !draggable.value.draggable) return;
  let touchItem = event.changedTouches?.length ? event.changedTouches[0] : { screenX: event.screenX, screenY: event.screenY };
  // 計算移動距離
  moveData.moveX = touchItem.screenX - moveData.touchX;
  moveData.moveY = touchItem.screenY - moveData.touchY;
  // 判斷是否為拖動
  if (!moveData.isMove) {
    if (moveData.moveX >= 0 && moveData.moveX < Math.abs(moveData.moveY)) {
      return;
    } else if (moveData.moveX < 0 && Math.abs(moveData.moveX) < Math.abs(moveData.moveY)) {
      return;
    }
    /** 清除自动播放 */
    startAutoPlay(false);
  }
  // 正在拖動
  moveData.isMove = true;
  disableTranstion.value = true;
  curIndex.value = -1;
  if (moveData.prevScreenX === 0) {
    moveData.moveValue = 0;
  } else {
    moveData.moveValue = touchItem.screenX - moveData.prevScreenX;
    curDeg.value += (draggable.value.widthDeg / toCurPX(Number($props.radius) * 2)) * moveData.moveValue;
  }

  /** 計算減速 */
  const now = Date.now();
  moveData.moveTime = now - moveData.lastTime;
  moveData.velocity = (touchItem.screenX - moveData.prevScreenX) / moveData.moveTime;
  moveData.lastTime = now;

  moveData.prevScreenX = touchItem.screenX;

  if (event.cancelable) {
    event.preventDefault();
  }
  // event.stopPropagation()
};
// 彈起事件
const touchendEvent = (event: TouchEvent & MouseEvent) => {
  if (!moveData.isStart) return;
  let touchItem = event.changedTouches?.length ? event.changedTouches[0] : { screenX: event.screenX, screenY: event.screenY };
  moveData.isStart = false;
  if (moveData.isMove) {
    if (!draggable.value.draggable) return;
    moveData.isMove = false;
    disableTranstion.value = false;
    moveData.prevScreenX = 0;
    moveData.moveValue = 0;
    animateInertia();
    return;
  } else {
    if (Math.abs(touchItem.screenX - moveData.touchX) < 10 && Math.abs(touchItem.screenY - moveData.touchY) < 10) {
      turnTableItemClick(event);
      return;
    }
  }
};

// 自動播放
let countTime = 0;
const autoplay = computed(() => {
  let obj: AutoPlay = {
    duration: 0,
    stayTime: 500,
  };
  if (typeof $props.autoplay === 'boolean') {
    obj.duration = $props.autoplay ? 10000 : 0;
  } else if (typeof $props.autoplay === 'number') {
    obj.duration = $props.autoplay;
  } else if (typeof $props.autoplay === 'object') {
    return Object.assign(obj, $props.autoplay);
  }
  return obj;
});
watch(autoplay, (val) => {
  startAutoPlay(false);
  if (val.duration !== 0) {
    startAutoPlay(true);
  }
});
const fps = 60;
const fpsTime = 1000 / fps;
const degFps = computed(() => (360 / autoplay.value.duration) * fpsTime);
let autoplayFrame: number = null;
let autoplayTimer: ReturnType<typeof setTimeout> = null;
let autoplayWaitTimer: ReturnType<typeof setTimeout> = null;

const startAutoPlay = (flag = true) => {
  clearTimeout(autoplayTimer);
  clearTimeout(autoplayWaitTimer);
  cancelAnimationFrame(autoplayFrame);
  if ($props.autoplay) {
    if (flag) {
      autoplayTimer = setTimeout(() => {
        autoplayFrame = requestAnimationFrame(autoPlayEvent);
      }, 1000);
    } else {
      // autoplayFrame =  requestAnimationFrame(autoPlayEvent)
    }
  }
};
// 自動播放事件
const autoPlayEvent: FrameRequestCallback = (time: DOMHighResTimeStamp) => {
  disableTranstion.value = true;
  const delta = time - countTime;
  if (delta >= fpsTime) {
    curDeg.value = Number(((curDeg.value - degFps.value) % 360).toFixed(2));
    countTime = time - (delta % fpsTime);
    let degVal = Number((curDeg.value / baseDeg.value).toFixed(2));
    let degValAbs = Math.abs(degVal);
    if (degValAbs % 1 <= 0.1 || degValAbs % 1 >= 0.9) {
      let index = Math.round(degValAbs);
      let maxIndex = 360 / baseDeg.value - 1;
      if (degVal > 0) {
        let i = index > maxIndex ? 0 : index;
        curIndex.value = turnTableList.value.length - i;
      } else {
        curIndex.value = index > maxIndex ? 0 : index;
      }
      let nextDeg = Number((((curDeg.value - degFps.value) % 360) / baseDeg.value).toFixed(2));
      let nextDegAbs = Math.abs(nextDeg);
      if (
        (nextDegAbs % 1 <= 0.1 && degValAbs % 1 >= 0.9) ||
        (nextDegAbs % 1 >= 0.9 && degValAbs % 1 <= 0.1) ||
        (nextDeg <= 0 && degVal > 0) ||
        (nextDeg >= 0 && degVal < 0)
      ) {
        /** 處理角度精度問題 */
        curDeg.value = index * baseDeg.value * (curDeg.value / Math.abs(curDeg.value));
        /** 停留时长 */
        if (autoplay.value.stayTime > 0) {
          return (autoplayWaitTimer = setTimeout(() => {
            startAutoPlay(false);
            autoplayFrame = requestAnimationFrame(autoPlayEvent);
          }, autoplay.value.stayTime));
        }
      }
    } else {
      curIndex.value = -1;
    }
  }
  autoplayFrame = requestAnimationFrame(autoPlayEvent);
};

const perspective = computed(() => {
  let perspectiveObj: Perspective = {
    distance: 'none',
    originY: 'center',
    offsetZ: '0px',
  };
  if (typeof $props.perspective === 'object') {
    let originY = $props.perspective.originY;
    console.log();
    if (!isNaN(Number(originY))) {
      originY = `${toCurPX(Number(originY))}px`;
    }
    perspectiveObj = Object.assign(perspectiveObj, {
      distance: `${toCurPX($props.perspective.distance as number)}px`,
      originY: originY,
      offsetZ: `${toCurPX($props.perspective.offsetZ as number)}px`,
    });
  } else if (typeof $props.perspective === 'number') {
    perspectiveObj.distance = `${toCurPX($props.perspective)}px`;
  }
  return perspectiveObj;
});
/** 转盘基础样式 */
const turnTableStyle = computed(() => {
  let radius = toCurPX(Number($props.radius));
  let baseRotateX = Math.abs(Number($props.rotateX)) / Number($props.rotateX) || 1;
  let totalHeight = radius;
  let elementHeight = Number(turnTableList.value[0]?.dataset?.height || 0);
  let elementWidth = Number(turnTableList.value[0]?.dataset?.width || 0);
  // 使用角度比例计算高度
  let rotateRad = Math.abs((Number($props.rotateX) * Math.PI) / 180);
  let scaleY = (((1 - Number($props.scale)) * elementHeight) / 2) * -baseRotateX;
  let offsetY = toCurPX(Number($props.offsetY));
  if ($props.front) {
    totalHeight =
      elementHeight * (1 - Math.sin(rotateRad)) +
      2 * (radius + (elementHeight - elementWidth) / 2) * Math.sin(rotateRad) +
      (Number($props.rotateX) <= 0 ? offsetY : -offsetY) -
      Math.abs(scaleY);
  } else {
    totalHeight =
      elementHeight * (1 - Math.sin(rotateRad)) +
      (2 * radius + elementHeight) * Math.sin(rotateRad) +
      (Number($props.rotateX) <= 0 ? offsetY : -offsetY) -
      scaleY;
  }

  if (totalHeight < elementHeight) {
    totalHeight = elementHeight * 2 - totalHeight;
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
    '--perspective': perspective.value.distance,
    '--perspectiveOrigin': `center ${perspective.value.originY}`,
    '--offsetZ': perspective.value.offsetZ,
  };
});
/** 角度樣式 */
const degStyle = ref<Record<string, any>>({});
/** 監聽角度變化 */
watch(
  curDeg,
  () => {
    degStyle.value['--deg'] = `${curDeg.value}deg`;
    degStyle.value['--degVal'] = `${curDeg.value <= 0 ? Math.abs(curDeg.value % 360) : 360 - (curDeg.value % 360)}`;
  },
  { immediate: true }
);

/** 監聽索引變化 */
watch(
  [curIndex, turnTableListEl],
  ([index, el]) => {
    if (el) {
      let oldEl = el.querySelector(`.${$props.selectClassName}`);
      let newEl = el.children[index];
      if (oldEl) {
        oldEl.classList.remove($props.selectClassName);
      }
      if (newEl) {
        newEl.classList.add($props.selectClassName);
      }
      // list.map((item, i) => {
      //   if (i === index) {
      //     item.classList.add('active')
      //   } else {
      //     item.classList.remove('active')
      //   }
      // })
      if (index > -1) {
        $emits('change', index);
      }
    }
  },
  { immediate: true }
);

/** 初始化 */
const initEl = () => {
  disableTranstion.value = true;
  turnTableList.value = Array.from((turnTableListEl.value?.children || []) as HTMLCollectionOf<HTMLDivElement>);
  curIndex.value = $props.initIndex;
  baseDeg.value = 360 / turnTableList.value.length;
  curDeg.value = curIndex.value * baseDeg.value * -1;
  turnTableList.value.forEach((item: HTMLDivElement, i) => {
    let box = item.getBoundingClientRect();
    let deg = i * baseDeg.value;
    item.dataset.baseDeg = String(deg);
    item.dataset.height = String(box.height);
    item.dataset.width = String(box.width);
    item.style.setProperty('--baseDeg', `${deg}deg`);
    item.style.setProperty('--itemWidth', `${box.width / 2}px`);
    item.style.setProperty('--baseDegVal', `${deg}`);
  });
  /** 初始化樣式 */
  // initStyle()
  nextTick(() => {
    disableTranstion.value = true;
    if (turnTableList.value.length) {
      ininted.value = true;
    }
    startAutoPlay();
  });
};

/** 監聽插槽變化 */
watch(
  () => $slots.default?.(),
  (val) => {
    if (!val) return;
    // 長度不變不初始化
    let children = val?.[0]?.children;
    if (turnTableList.value?.length === children.length) {
      return;
    }
    nextTick(() => {
      initEl();
    });
  },
  { immediate: true }
);

const turnNext = (anime = true) => {
  let index = curIndex.value + 1;
  if (index >= turnTableList.value.length) {
    index = 0;
  }
  turnTableItem(index, anime);
};

const turnPrev = (anime = true) => {
  let index = curIndex.value - 1;
  if (index <= 0) {
    index = turnTableList.value.length - 1;
  }
  turnTableItem(index, anime);
};

const trunToIndex = (index: number, anime = true) => {
  if (ininted.value) {
    if (index < 0 || index >= turnTableList.value.length) return false;
    turnTableItem(index, anime);
  } else {
    let watchCb = watch(ininted, (val) => {
      if (val) {
        if (index < 0 || index >= turnTableList.value.length) return false;
        turnTableItem(index, anime);
        watchCb();
      }
    });
  }
};

defineExpose({
  initEl,
  turnNext,
  turnPrev,
  trunToIndex,
});
</script>
<style lang="scss" scoped>
.turntable {
  position: relative;
  transform-style: preserve-3d;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  // width: var(--width);
  // height: var(--height);
  ::v-deep(.turntable_list) {
    &.transition > * {
      transition: all var(--duration);
    }
    transform-style: preserve-3d;
    perspective: var(--perspective);
    perspective-origin: var(--perspectiveOrigin, center center);
    width: var(--width);
    height: var(--height);
    > *:not(.turntable_center) {
      --degAbs: max(calc(var(--baseDegVal) - var(--degVal)), calc(var(--degVal) - var(--baseDegVal)));
      --dRing: min(var(--degAbs), 360 - var(--degAbs));
      --scaleZ: calc(1 - var(--dRing) / 180);
      opacity: calc(var(--scaleZ) + (1 - var(--scaleZ)) * var(--opacity));
      position: absolute;
      top: 50%;
      left: 50%;
      /** 中心向外 */
      transform: translate3d(
          -50%,
          calc(var(--offsetY) * (var(--scaleZ) - 0.5) + -50% + var(--scaleY)),
          calc(var(--radius) * 2 + var(--offsetZ, 0))
        )
        rotateX(var(--rotateX)) rotateY(calc(var(--deg) + var(--baseDeg))) translate3d(0, 0, var(--radius))
        rotateY(calc((var(--deg) + var(--baseDeg)) * -1)) rotateX(calc(var(--rotateX) * -1)) rotateY(calc(var(--deg) + var(--baseDeg)))
        scale(calc(var(--scale) + ((1 - var(--scale)) * var(--scaleZ))));
    }
    &.front {
      > *:not(.turntable_center) {
        /** 面向前方 */
        transform: translate3d(-50%, calc(var(--offsetY) * (var(--scaleZ) - 0.5) + -50% + var(--scaleY)), 0) rotateX(var(--rotateX))
          rotateY(calc(var(--deg) + var(--baseDeg))) translate3d(0, 0, calc(var(--radius) - var(--itemWidth)))
          rotateY(calc((var(--deg) + var(--baseDeg)) * -1)) rotateX(calc(var(--rotateX) * -1))
          scale(calc(var(--scale) + ((1 - var(--scale)) * var(--scaleZ)))) translate3d(0, 0, calc(var(--radius) * 2 + var(--offsetZ, 0)));
      }
    }
  }
  .turntable_center {
    position: absolute;
    // top: 50%;
    // left: 50%;
    // transform: translate3d(-50%, -50%, 0);
    transform: translate3d(0, 0, calc(var(--radius) * 2 + var(--offsetZ, 0)));
  }
}
</style>
