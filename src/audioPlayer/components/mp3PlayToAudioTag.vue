<template>
 <playCanvas :list="arr"></playCanvas>
  <div class='mp3Play'>
    <audio
      ref="audio"
      src="/static/Blazo,CL - Deacon Blu.mp3"
      v-show="false" 
      @pause="changeStatus('pause')"
      @play="changeStatus('play')"
      @timeupdate="timeupdate"
      webkit-playsinline playsinline
    ></audio>
    <div :class="[isPlay ? 'pause' : 'play']" @click="changeStatus('start')"></div>
    <div class="playing"  :class="{run1 : isPlay , loading: isLoading}" ref="playing">
      <span
       class="playing__bar"
       v-for="i in length"
       :key="i"
       :class="['playing__bar' + i]"
       :style="{transform: `scaleY(${arr[i] && `${(arr[i] / 255)  * 100}%`}`}"
       ></span>
    </div>
    <div class="currentTime">
      {{ currentTime }}
    </div>
    <!-- <div class="tip" @click="time++">{{ time }}</div> -->
  </div>
</template>
<script>
import playCanvas from './playCanvas.vue';
// 使用浏览器自带audio标签,进行实现可视化, iOS会有兼容问题
export default {
  components: {playCanvas},
  data () {
    return {
      // src: 'https://www.miyachat.com/resource/mp3/10441495.mp3',
      isPlay: false, // 正在播放
      isLoading: false,
      audio: null, // 储存audio标签
      audioCtx: null, // 
      duration: 0, // 时长
      length: 30, // 可视化柱子数量
      time: 0, // 当前时间
      analyser: null,
      config: { attributes: true, childList: true, subtree: true },
      arr: [],
      index: 0,
      level: 3
    }
  },
  mounted () {
    this.audio = this.$refs.audio;
  },
  computed: {
    src () {
      return `${location.origin}${location.pathname.replace('/index.html', '/')}static/Lupins.mp3?t=${window.timestamp}`
    },
    currentTime () {
      let ts = parseInt(this.time);
      let s = ts % 60;
      let m = Math.floor(ts / 60);
      return `${ m < 10 ? `0${ m }` : m }"${ s < 10 ? `0${ s }` : s }`
    }
  },
  methods: {
    changeStatus (val) {
      console.log(val)
      if (val === 'pause') {
        this.isPlay = false;
        cancelAnimationFrame(this.index);
      } else if (val === 'play') {
        this.duration = parseInt(this.audio.duration);
        this.isPlay = true;
        if (!this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          let source = this.audioCtx.createMediaElementSource(this.audio);
          let gainNode = this.audioCtx.createGain();
          this.analyser = this.audioCtx.createAnalyser();
	        this.analyser.fftSize =  32*(2**this.level);
          source.connect(gainNode); // 聲音控制
          source.connect(this.analyser);  // 可視化控制
          gainNode.connect(this.audioCtx.destination);
          console.log(this.analyser, this.audioCtx.createMediaElementSource, source);
        }
    	  requestAnimationFrame(this.anime);
      } else if (val === 'start') {
        this.isPlay ? this.audio.pause() : this.audio.play();
      } else {
      }
    },
    // 播放時間改變時觸發
    timeupdate ({target}) {
      this.time = target.currentTime;
    },
    anime () {
      var arr = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(arr);
      this.arr = arr;
      this.isPlay 
	    this.index = requestAnimationFrame(this.anime);
    }
  },
}
</script>
<style lang='scss' scoped>

// mp3播放器样式
.mp3Play {
  font-size: 32px;
  color: #fff;
  background: #6666;
  width: 372px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 50px;
  height: 76px;
  padding:  0;
  background: linear-gradient(90deg,#ffa617 2%, #ffbb13);
  border-radius: 0 48px 48px 0;
  padding: 10px 0;
  margin-left: 50px;
  position: relative;
  left: 10px;
  .play, .pause {
    height: 100px;
    width: 100px;
    margin-left: -50px;
  }
  .play {
    background: url(@src/assets/image/play.png) no-repeat center / 100%;
  }
  .pause {
    background: url(@src/assets/image/pause.png) no-repeat center / 100%;
  }
  .currentTime {
    // flex: 1;
    text-align: right;
    padding-right: 20px;
    box-sizing: content-box;
    width: 100px;
    // margin: 0 10px;
    position: relative;
    z-index: 0;
    .bar {
      content: '';
      position: absolute;
      z-index: -1;
      height: 100%;
      width: 0%;
      left: 0;
      top: 0;
      background: linear-gradient(to right, #cad, #eda, #ade) no-repeat center left / 750px 100%;
    }
  }
  .playing {
    flex: 1;
    padding-left: 24px;
    height: 50px;
    border-radius: 1px;
    justify-content: space-between;
    // padding: 5px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    &.run .playing__bar {
      flex: 1;
      animation: up-and-down 3s linear infinite alternate;
       @for $i from 1 to 11 {
        &:nth-of-type(#{$i}){
          animation-delay: -#{1.2 * $i}s;
        }
      }
    }
    &.loading .playing__bar  {
      height: 20%;
      animation: loading 5s linear infinite;
      @for $i from 1 to 21 {
        &:nth-of-type(#{$i}){
          animation-delay: calc(5 / 20 * #{$i - 1}s);
        }
      }
    }
    .playing__bar {
      flex: 1;
      height: 80px;
      display: inline-block;
      background: white;
      border-radius: 3px;
      margin: 1px;
      transform: scaleY(0);
    }
  }
  .tip {
    width: auto;
    white-space: nowrap;
    word-break: normal;
    padding: 19px 24px;
    background: #FFFFFF;
    color: #2B2B2B;
    position: absolute;
    left: calc(50% - 40px);
    transform: translateX(-50%);
    top: 110px;
    border-radius: 12px 12px 12px 8px;
    &::before {
      content: '';
      position: absolute;
      height: 20px;
      width: 30px;
      top: -10px;
      left: calc(50% - 160px);
      background: #FFFFFF;
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
    }
    span {
      color: #2B2B2B;
      font-size: 28px;
      white-space: nowrap;
    }
  }
}

</style>
