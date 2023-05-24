<template>
  <div class="gift_content" >
    <div class="gift_list" :class="{ play }">
      <div
        v-for="(item, i) in rewardList"
        :key="i"
        class="gift_item"
        @animationiteration="animationiteration"
        :data-id="i"
        :style="{
          '--delay': `-${time - (i * time) / num}s`,
          '--time': `${time}s`,
        }"
        :class="{light: i == sel}"
      >
      {{ i }}
        <!-- <img v-if="item.imageUrl" :src="picAnalysis(item.imageUrl)" /> -->
        <!-- <div class="symbol" v-if="item.description">{{ parseRewardListRemark(item.description).tag }}</div> -->
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()


const time = 20
// let play = ref(false)
let rewardList = computed(() => Array.from(new Array(10), (item, index) => index))
// 格式化备注
const parseRewardListRemark = (remark) => {
  try {
    return JSON.parse(remark)
  } catch (err) {
    return {}
  }
}
const num = computed(() => rewardList.value?.length)
const props = defineProps({
  isGuide: { type: Boolean, default: false },
})

// 点击所有奖励
const showAllReward = () => {
  router.replace('allReward')
}

const play = ref(true)
const sel = ref(0);
const animationiteration = (e) => {
  play.value = false;
  sel.value = e.target.dataset.id;
  setTimeout(() => {
    play.value = true
    sel.value = -1;
  }, 500)
}
</script>
<style lang="scss">
@keyframes rotate1 {
  0% {
    transform: translateX(-50%) rotate3d(0, 1, 0, 0) translateZ(250px) rotate3d(0, 1, 0, 360deg);
  }
  20% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) rotate3d(0, 1, 0, 360deg) translateZ(250px) rotate3d(0, 1, 0, 0);
  }
}
.a {
      animation: 10s rotate1 infinite linear reverse;
}
@keyframes rotate {
  0% {
    transform: translateX(-50%) rotate3d(0, 1, 0, 0) translateZ(250px) rotate3d(0, 1, 0, 360deg);
    opacity: 1;
  }
  20% {
  }
  50% {
    opacity: 0.2;
  }
  80% {
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) rotate3d(0, 1, 0, 360deg) translateZ(250px) rotate3d(0, 1, 0, 0);
  }
}
</style>
<style lang="scss">
.gift_content {
  width: 750px;
  min-height: 300px;
  position: relative;
  padding-top: 60px;
  background: #5576f7;
  .gift_list {
    --time: 20s;
    --delay: 10s;
    $time: var(--time);
    $delay: var(--delay);
    width: 100%;
    height: 187px;
    perspective: 1500px;
    position: relative;
    // top: 60px;
    transform-style: preserve-3d;
    transform: rotateX(-15deg);
    margin-bottom: 30px;
    .gift_item {
      width: 174px;
      height: 187px;
      position: absolute;
      left: 50%;
      bottom: 0;
      animation: #{$time} rotate infinite linear reverse;
      animation-delay: $delay;
      animation-play-state: paused;
      background: #adc;
      border-radius: 5px;
      border: 2px solid salmon;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 50px;
      color: #fff;
      &.light {
        background: #bbe;
      }
    }
    &.play {
      .gift_item {
        animation-play-state: running;
      }
    }
  }
}
</style>
