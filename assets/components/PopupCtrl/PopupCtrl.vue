<!-- 弹窗控制 -->
<template>
  <div class="popup_ctrl">
    <transition-group :duration="duration" @beforeEnter="animeEvent($event, 'beforeEnter')" @afterEnter="animeEvent($event, 'afterEnter')">
      <!-- 彈窗 -->
      <div
        class="popup_ctrl_mask"
        @click.stop.self="item.option.maskClose && item.close()"
        v-for="item in popupList"
        :key="item.name"
        :style="{ '--opacity': item.option.opacity, zIndex: item.option.zIndex || 99999 + item.id }"
        :class="[item.option.anime]"
      >
        <div class="popup_ctrl_content" v-if="item.name">
          <Component v-on="item.event" v-bind="item.data" :is="item.name" :popupId="item.id" :ref="item.onRef"></Component>
        </div>
      </div>
      <!-- toast -->
      <div class="popup_ctrl_toast" v-for="item in toastList" :key="item.id"
        :style="{zIndex: 99999 + item.id }"
      >{{ item.text }}</div>
    </transition-group>
  </div>
</template>
<script setup lang="ts">
import { computed,  watch, inject, ref, nextTick } from 'vue'

const popupStore = inject('popupStore')
// 弹窗列表
const popupList = computed(() => popupStore.popupList)
// toast列表
const toastList = computed(() => popupStore.toastList)
// 
const lastPopup = computed(() => popupList.value[popupList.value.length - 1])
/** 動畫時長 */
const duration = computed(() => {
  const time = {
    enter: 300,
    leave: 300,
  }
  return time
});

watch(
  popupList,
  (val) => {
    if (val.length) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true, deep: true }
)

// 動畫事件
const animeEvent = (el, name) => {
  // boom 播放apng動畫
  if (lastPopup.value?.option?.anime === 'boom') {
    if (name === 'beforeEnter') {
    } else if (name === 'afterEnter') {
    }
  }
}

</script>
<style lang="scss">

.popup_ctrl {
  z-index: 9999;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  .popup_ctrl_mask {
    z-index: 1;
    position: absolute;
    pointer-events: auto;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba($color: #17191E, $alpha: var(--opacity, 0.88));
    transition: background 0.3s;
    display: flex;
    &.v-enter-from, 
    &.v-leave-to {
      background: #00000000;
    }

    // 中间放大
    &.center {
      align-items: center;
      justify-content: center;
      .popup_ctrl_content {
        transition: transform 0.3s;
      }
      &.v-enter-from,
      &.v-leave-to {
        .popup_ctrl_content {
          transform: scale(0.2);
        }
      }
    }
    // 底部弹出
    &.bottom {
      align-items: flex-end;
      transform: translateY(0);
      .popup_ctrl_content {
        transition: transform 0.3s;
      }
      &.v-enter-from,
      &.v-leave-to {
        .popup_ctrl_content {
          transform: translateY(100%);
        }
      }
    }
    // 彈跳進入
    &.bounce {
      align-items: center;
      justify-content: center;
      // 進入動畫
      @keyframes bounceEnter {
        0% {
          transform: scale(0.8);
          filter: opacity(0);
        }
        14% {
          transform: scale(1.1);
          filter: opacity(1);
        }
        28% {
          transform: scale(1);
        }
        42% {
          transform: scale(1.02);
        }
        60% {
          transform: scale(1);
        }
      }
      // 離開動畫
      @keyframes bounceLeaver {
        from {
          transform: scale(1);
          filter: opacity(1);
        }
        to {
          transform: scale(0.2);
          filter: opacity(0);
        }
      }
      .popup_ctrl_content {
        opacity: 1;
        animation: bounceEnter 1s linear;
        transition: all 0.3s;
      }
      // &.v-enter-from,
      &.v-leave-to {
        .popup_ctrl_content {
          animation: bounceLeaver 0.3s linear;
          opacity: 0;
        }
      }
    }
  }

  // toast樣式
  .popup_ctrl_toast {
    pointer-events: auto;
    user-select: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: max-content;
    max-width: 70%;
    min-width: 250px;
    background: rgba($color: #000, $alpha: var(--opacity, 0.80));
    font-size: 28px;
    font-weight: 400;
    line-height: 32px;
    color: #ffff;
    padding: 14px 40px;
    border-radius: 10px;
    word-break: break-word;
    text-align: center;
    opacity: 1;
    transition: 0.3s opacity;
    &.v-enter-from, 
    &.v-leave-to {
      opacity: 0;
    }
  }
}
</style>
