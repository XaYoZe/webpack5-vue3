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
    <span>面朝前方</span><button @click="front = !front">{{ front }}</button>
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
  <div class="row">
    <span>自动轮播:</span><button @click="showAutoPlay = !showAutoPlay">{{ showAutoPlay }}</button>
  </div>
  <template v-if="showAutoPlay">
    <div class="row">
      <span>播放时长</span><input type="text" v-model="autoplay.duration" />
    </div>
    <div class="row">
      <span>停留时长</span><input type="text" v-model="autoplay.stayTime" />
    </div>
  </template>
  <div  class="row">
    <span>透视效果:</span><button @click="showPerspective = !showPerspective">{{ showPerspective }}</button>
  </div>
  <template v-if="showPerspective">
    <div class="row">
      <span>透视距离: </span>
      <input type="range" id="volume" name="volume" min="0" max="10000" v-model="perspective.distance" />
      <span>{{ perspective.distance }}</span>
    </div>
    <div class="row">
      <span>透视中心Y轴: </span>
      <input type="range" id="volume" name="volume" min="0" max="10000" v-model="perspective.originY" />
      <span>{{ perspective.originY }}</span>
    </div>
    <div class="row">
      <span>前后偏移: </span>
      <input type="range" id="volume" name="volume" min="-1000" max="1000" v-model="perspective.offsetZ" />
      <span>{{ perspective.offsetZ }}</span>
    </div>
  </template>
</div>
<div class="demo_box" :style="{ minHeight: `600px` }">
  <TurnTable ref="trunTable" class="turn_table_box"
  click
draggable
 :radius="radius" :designWidth="false" :rotateX="rotateX" :scale="scale" :front="front" :opacity="opacity" :offsetY="offsetY" :autoplay="showAutoPlay && autoplay" :duration="duration" :perspective="showPerspective && perspective" >
    <div class="turn_table_item" v-for="i in 10" :key="i">{{ i }} </div>
    <template #center>
     <div class="center_line"></div>
    </template>
  </TurnTable>
</div>
<div class="props_list">
  <div class="props_item" v-if="front"><span style="color: #A6E22E">front</span></div>
  <div class="props_item">:<span style="color: #A6E22E">rotateX</span>="{{rotateX}}"</div>
  <div class="props_item">:<span style="color: #A6E22E">radius</span>="{{radius}}"</div>
  <div class="props_item">:<span style="color: #A6E22E">scale</span>="{{scale}}"</div>
  <div class="props_item">:<span style="color: #A6E22E">opacity</span>="{{opacity}}"</div>
  <div class="props_item">:<span style="color: #A6E22E">offsetY</span>="{{offsetY}}"</div>
  <div class="props_item">:<span style="color: #A6E22E">autoplay</span>="{{autoplay}}"</div>
  <div class="props_item">:<span style="color: #A6E22E">duration</span>="{{duration}}"</div>
  <div class="props_item" v-if="perspective">:<span style="color: #A6E22E">perspective</span>="{{perspective}}"</div>
</div>

  </div>
</template>
<script setup>

import { ref, reactive } from 'vue';

const front = ref(true);
const trunTable = ref(null)
const rotateX = ref(-15);
const radius = ref(250)
const scale = ref(1)
const opacity = ref(1)
const offsetY = ref(0);
const duration = ref(300)
const perspectiveOrigin = ref(0)

const showAutoPlay = ref(false);
const autoplay = ref({
  duration: 10000,
  stayTime: 1000
});


const showPerspective = ref(false);
const perspective = reactive({
  distance: 10000,
  originY: 0,
  offsetZ: 0
}); 

</script>

<style lang="scss" scoped>
.turntable_demo {
  wdith: 100%;
  padding: 20px 20px 0 ;
  
  .props_list {
    background: #000;
    line-height: 20px;
    padding: 10px 0;
    color: #fff;
    .props_item {
      padding-left: 20px;
    }
  }
  .ctrl_box {
    .row {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      span {
        padding-right:  10px;
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
          content:'';
          width: 1px;
          height: 100px;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: #4bc
        }

      }
      .center_line {
        width: 1px;
        height: 800px;
        background: #666;
      }
    }
  }
}
</style>
