<template>
  <div class="turntable_demo">
    
  <div class="ctrl_box">
    <div class="row">
      <span>半径: </span>
      <input type="range" id="volume" name="volume" min="0" max="400" v-model="radius" />
      <span>{{ radius }}</span>
    </div>
    <div class="row">
      <span>上下偏移: </span>
      <input type="range" id="volume" name="volume" min="-400" max="400" v-model="offsetY" />
      <span>{{ offsetY }}</span>
    </div>
    <div class="row">
      <span>前后偏移: </span>
      <input type="range" id="volume" name="volume" min="-400" max="400" v-model="offsetZ" />
      <span>{{ offsetZ }}</span>
    </div>
    <div class="row">
      <span>透视距离: </span>
      <input type="range" id="volume" name="volume" min="0" max="10000" v-model="perspective" />
      <span>{{ perspective }}</span>
    </div>
    <div class="row">
      <span>面朝前方</span><button @click="front = !front">{{ front }}</button>
    </div>
    <div class="row">
      <span>自动轮播</span><button @click="autoplay = !autoplay">{{ autoplay }}</button>
    </div>
    <div class="row">
      <span>X轴角度: </span>
      <input type="range" id="volume" name="volume" min="-90" max="90" v-model="rotateX" />
      <span>{{ rotateX }}</span>
    </div>
    <div class="row">
      <span>缩放: </span>
      <input type="range" v-model="scale" max="1" min="0.1" step="0.1" />
      <span>{{ scale }}</span>
    </div>
    <div class="row">
      <span>透明度: </span>
      <input type="range" v-model="opacity" max="1" min="0.1" step="0.1" />
      <span>{{ opacity }}</span>
    </div>
    <div class="row">
      <span>过渡时长: </span>
      <input type="text" v-model="duration" />
    </div>
  </div>
  <div class="demo_box" :style="{ minHeight: `600px` }">
    <TurnTable
      ref="trunTable"
      class="turn_table_box"
      click
      draggable
      :radius="radius"
      :designWidth="false"
      :rotateX="rotateX"
      :scale="scale"
      :front="front"
      :opacity="opacity"
      :offsetY="offsetY"
      :autoplay="autoplay"
      :duration="duration"
      :perspective="perspective"
      :offsetZ="offsetZ"
    >
      <div class="turn_table_item" v-for="i in 10" :key="i">{{ i }}</div>
      <template #center>
        <div class="center_line"></div>
      </template>
    </TurnTable>
  </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';

const front = ref(true);
const trunTable = ref(null);
const rotateX = ref(-15);
const radius = ref(400);
const scale = ref(1);
const opacity = ref(1);
const offsetY = ref(0);
const offsetZ = ref(0);
const autoplay = ref(10000);
const duration = ref(300);
const perspective = ref(0);
</script>

<style lang="scss" scoped>
.turntable_demo {
  wdith: 100%;
  padding: 20px 20px 0 ;
}
.ctrl_box {
  .row {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    span {
      padding-right: 10px;
    }
    button {
      margin-left: 10px;
      border: 1px solid #eee;
      padding: 5px 10px;
      border-radius: 5px;
    }
    input {
      border: 1px solid #eee;
      padding-left: 10px;
    }
  }
}
.demo_box {
  position: relative;
  z-index: 9;
  .turn_table_box {
    user-select: none;
    .turn_table_item {
      width: 100px;
      height: 100px;
      background: #aed;
      border: 3px solid #bca;
      &.turn_table_item_active {
        background: #ace;
      }
      &:after {
        content: '';
        width: 1px;
        height: 100px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: #4bc;
      }
    }
    .center_line {
      width: 1px;
      height: 800px;
      background: #666;
    }
  }
}
</style>
