<template>
  
<div class="turntable_demo">
  <div class="turntable_view">
    <div class="panel_content ctrl_box">
      <div class="panel_title">參數調整</div>
      <div class="row">
        <span>半径: </span>
        <input type="range" id="volume"  step="1" name="volume" min="100" max="300" v-model="radius" />
        <span>{{ radius }}</span>
      </div>
      <div class="row">
        <span>上下偏移: </span>
        <input type="range" id="volume"  step="1" name="volume" min="-200" max="200" v-model="offsetY" />
        <span>{{ offsetY }}</span>
      </div>
      <div class="row">
        <span>X轴角度: </span>
        <input type="range" id="volume" step="1" name="volume" min="-90" max="90" v-model="rotateX" />
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
        <span>面朝前方</span><button @click="front = !front">{{ front }}</button>
      </div>
      <div class="row">
        <span>可點擊</span><button @click="click = !click">{{ click }}</button>
      </div>
      <div class="row">
        <span>可拖動</span><button @click="draggable = !draggable">{{ draggable }}</button>
      </div>
      <div class="row">
        <span>过渡时长: </span>
        <input type="text" v-model="duration" />
      </div>
      <div class="row">
        <span>自动轮播:</span><button @click="showAutoPlay = !showAutoPlay">{{ showAutoPlay }}</button>
      </div>
      <template v-if="showAutoPlay">
        <div class="row"><span>播放时长</span><input type="text" v-model="autoplay.duration" /></div>
        <div class="row"><span>停留时长</span><input type="text" v-model="autoplay.stayTime" /></div>
      </template>
      <div class="row">
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
    <div class="panel_content demo_box">
      <div class="panel_title">效果預覽</div>
      <ClientOnly>
        <Turntable
          ref="truntable"
          class="turntable_box"
          :click="click"
          :draggable="draggable"
          :radius="radius"
          :designWidth="false"
          :rotateX="rotateX"
          :scale="scale"
          :front="front"
          :opacity="opacity"
          :offsetY="offsetY"
          :autoplay="showAutoPlay && autoplay"
          :duration="duration"
          :perspective="showPerspective && perspective"
          @change="onChange"
        >
          <div class="turntable_item" v-for="i in 10" :key="i">{{ i }}</div>
          <template #center>
            <div class="center_line"></div>
          </template>
        </Turntable>
      </ClientOnly>
    </div>
  </div>
  <div class="panel_title">props參數</div>
  <div class="panel_content props_list">
    <div class="props_item" v-if="click"><span style="color: #a6e22e">click</span></div>
    <div class="props_item" v-if="draggable"><span style="color: #a6e22e">draggable</span></div>
    <div class="props_item" v-if="front"><span style="color: #a6e22e">front</span></div>
    <div class="props_item" v-if="rotateX !== 0">:<span style="color: #a6e22e">rotateX</span>="{{ rotateX }}"</div>
    <div class="props_item" v-if="radius !== 375">:<span style="color: #a6e22e">radius</span>="{{ radius }}"</div>
    <div class="props_item" v-if="opacity !== 1">:<span style="color: #a6e22e">scale</span>="{{ scale }}"</div>
    <div class="props_item" v-if="opacity !== 1">:<span style="color: #a6e22e">opacity</span>="{{ opacity }}"</div>
    <div class="props_item" v-if="offsetY !== 0">:<span style="color: #a6e22e">offsetY</span>="{{ offsetY }}"</div>
    <div class="props_item" v-if="duration !== 300">:<span style="color: #a6e22e">duration</span>="{{ duration }}"</div>
    <div class="props_item" v-if="showAutoPlay">:<span style="color: #a6e22e">autoplay</span>="{{ autoplay }}"</div>
    <div class="props_item" v-if="showPerspective">:<span style="color: #a6e22e">perspective</span>="{{ perspective }}"</div>
  </div>
</div>
</template>
<script setup>
import { ref, reactive } from 'vue';

const front = ref(true);
const truntable = ref(null);
const rotateX = ref(-45);
const radius = ref(250);
const scale = ref(1);
const opacity = ref(1);
const offsetY = ref(0);
const duration = ref(300);
const perspectiveOrigin = ref(0);
const click = ref(true);
const draggable = ref(true);
const showAutoPlay = ref(false);
const autoplay = ref({
  duration: 10000,
  stayTime: 1000,
});

const showPerspective = ref(false);
const perspective = reactive({
  distance: 10000,
  originY: 0,
  offsetZ: 0,
});

const onChange = (index) => {
  console.log('onChange', index);
};
</script>

<style lang="scss" scoped>
.turntable_demo {
  width: 100%;
  padding: 20px 10px 0 ;
  .panel_title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .props_list {
    background: #000;
    line-height: 20px;
    padding: 10px 0;
    color: #fff;
    .props_item {
      padding-left: 20px;
    }
  }
  .turntable_view {
    user-select: none;
    display: flex;
    position: relative;
    .ctrl_box {
      position: relative;
      width: max-content;
      z-index: 1;
    }
    
    .demo_box {
      width: 400px;
      position: absolute;
      right: 0;
      .turntable_box {
        user-select: none;
        .turntable_item {
          width: 100px;
          height: 100px;
          background: #aed;
          border: 3px solid #bca;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          flex-direction: column;
          &.turntable_item_active {
            background: #ace;
          }
          &:after, &:before  {
            content: '';
            flex: 1;
            width: 1px;
            background: #4bc;
          }
        }
        .center_line {
          width: 1px;
          height: 250px;
          background: #666;
        }
      }
    }
  }
  .panel_content {
    margin-bottom: 20px;
    .row {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      span {
        padding-right: 5px;
      }
      button {
        margin-left: 10px;
        border: 1px solid #eee;
        padding: 5px 10px;
        border-radius: 5px;
      }
      input {
        border: 1px solid #eee;
        width: 120px;
        &[type="text"] {
          padding-left: 10px;
        }
      }
    }
  }
}
</style>