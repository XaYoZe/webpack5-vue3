<template>
  <div class='audioPlayer'>
    <div class="visualization">
      <playCanvas :list="arr"></playCanvas>
      <!-- <canvas ref="canvas"></canvas> -->
      <!-- <div class="bar" v-for="(n,i) in arr" :key="i" :style="{height: `${(n / 255) * 100}%`}" ></div> -->
    </div>
    <div class="ctrl">
      <div  :class="[isPlay ? 'pause' : 'play']" @click="clickStart('start')"></div>
      <div class="timeline" @click="changeTime">
        <div class="timelineLength" :style="{width: `${(runTime - startPlayTime + skipPlayTime) / duration * 100}%`}"></div>
      </div>
      <div class="time">{{ currentTime }}</div>
      <div class="voices" @click="changeVoices">
        <div class="voicesBar" :style="{left: `${voicesSize * 100}%`}"></div>
      </div>
    </div>
    <div class="list">
      <div v-for="(item, key) in list" :key="key" :class="{active: key === selectAudio}" @click="clickAudioList(key)">
        {{ key }}
      </div>
    </div>
    <img src="/static/29.jpg" >
  </div>
</template>
<script>
import playCanvas from './playCanvas'
// 通过ajax请求音频,使用js来播放音频, iOS可以使用, 缺点: 不能边缓存边播
export default {
  components: {playCanvas},
  data () {
    return {
      isPlay: false, // 正在播放
      audioCtx: null,
      duration: 0,
      runTime:  0, // audio运行时间
      startPlayTime: 0, // 开始播放的时间，相对运行时间
      skipPlayTime: 0,
      length: 20,
      analyser: null,
      config: { attributes: true, childList: true, subtree: true },
      arr: new Array(16).fill(),
      index: 0, // 動畫定時器
      map3Buffer: null, // mp3數據
      audioCache: {}, // 緩存mp3數據
      isLoading: false, // 加載動畫
      gainNode: null, // 音量控制
      voicesSize: 1, // 聲音長度
      selectAudio: '光良 - 童话',
      num: 4 // 柱子數量
    }
  },
  created () {
    this.initAudio();
  },
  computed: {
    dirPath () {
      return `${location.origin}${location.pathname.replace('/index.html', '/')}static/`
    },
    list () {
      return {
        'Rude Boy & White Cherry - Late Night Melancholy': this.audioPath('Rude Boy & White Cherry - Late Night Melancholy.mp3'),
        'Lupins' : `${location.origin}${location.pathname.replace('/index.html', '/')}static/Lupins.mp3?t=${window.timestamp}`,
        '光良 - 童话': `${location.origin}${location.pathname.replace('/index.html', '/')}static/光良 - 童话.mp3?t=${window.timestamp}`,
        '麦振鸿 - 莫失莫忘(逍遥叹 演奏曲)': `${location.origin}${location.pathname.replace('/index.html', '/')}static/麦振鸿 - 莫失莫忘(逍遥叹 演奏曲).mp3?t=${window.timestamp}`,
      }
    },
    // 当前播放时间
    currentTime () {
      let ts = parseInt(this.runTime - this.startPlayTime + this.skipPlayTime);
      let s = ts % 60;
      let m = Math.floor(ts / 60);
      return `${ m < 10 ? `0${ m }` : m }'${ s < 10 ? `0${ s }` : s }"`
    }
  },
  methods: {
    audioPath (name) {
      return `${location.origin}${location.pathname.replace('/index.html', '/')}static/${name}?t=${window.timestamp}`
    },
    // 封裝ajax
    ajax (options) { // ajax方法
      return new Promise(function (resolve, reject) {
        let url = options.url || 'http://localhost:80/';
        let type = options.type || 'get';
        let data = options.data || null;
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (err) {
          reject({status: xhr.status, des: xhr.response});
        }
        xhr.open(type, url);
        options.headers && Object.keys(options.headers).forEach(key => {
          xhr.setRequestHeader(key, options.headers[key]);
        })
        options.responseType && (xhr.responseType = options.responseType)
        xhr.send(data);
      })
    },
    // 获取音乐数据
    getAudioData (url) {
      this.isLoading = true;
      return this.ajax({
        url: url,
        responseType:'arraybuffer'
      }).then(async (data) => {
        return await this.decodeAudioData(data);
      }).catch(err => {
        console.log('獲取音頻失敗!', err);
      }).finally(() => {
        this.isLoading = false;
      })
    },
    async clickStart () {
      if (!this.audioCache[this.selectAudio] && !this.isLoading) { // 如果沒有音樂
        await this.getAudioData(this.list[this.selectAudio]); // 獲取音樂數據
        // this.clickStart();
        // return
      }
      if (this.isPlay) { // 正在播放
        this.isPlay = false; // 修改播放狀態
        this.audioCtx.suspend(); // 暫停
        cancelAnimationFrame(this.index); // 清楚動畫定時器
      } else {
        if (!this.AudioBufferSourceNode) {
          this.startPlay()
        }
        this.audioCtx.resume();
        requestAnimationFrame(this.visualization);
      }
    },
    // 获取可视化数据并渲染
    visualization () {
      // console.log(this.audioCtx.getOutputTimestamp());
      var arr = new Uint8Array(this.analyser.frequencyBinCount);
      var state = this.audioCtx.state;
      this.analyser.getByteFrequencyData(arr);
      this.arr = arr;
      this.runTime = this.audioCtx.currentTime;
      if (state === "running") {
        this.isPlay = true;
      } else {
        this.isPlay = false;
      }
      this.index = requestAnimationFrame(this.visualization);
    },
    changeTime (e) { // 點擊事件軸
      if (!this.AudioBufferSourceNode) return;
      this.AudioBufferSourceNode.onended = () => {};
      this.AudioBufferSourceNode.stop();
      let timeline = (e.offsetX / e.target.offsetWidth) * this.duration
      this.startPlay(timeline);
      console.log('修改時間軸', timeline);
    },
    /**
     * @description 开始播放
     * @param {number} timeline 开始播放的时间
     */
    startPlay (timeline = 0) {
      this.AudioBufferSourceNode = this.audioCtx.createBufferSource();
      // this.AudioBufferSourceNode.playbackRate // 速度控制
      this.AudioBufferSourceNode.onended = () => { // 音樂播放結束觸發
        console.log('結束播放');
        cancelAnimationFrame(this.index); // 清除動畫定時器
        this.arr = new Array(8*(2**this.num)).fill(0);
        this.audioCtx.suspend(); // 暫停
        this.runTime = this.startPlayTime = this.skipPlayTime = 0;
        // this.audioCtx.listener.positionX.value = 0
        // this.currentTime = this.duration;
        this.isPlay = false;
        this.AudioBufferSourceNode = null;
      }
      this.AudioBufferSourceNode.buffer = this.audioCache[this.selectAudio];
      this.AudioBufferSourceNode.connect(this.gainNode); // 链接声音
      this.AudioBufferSourceNode.connect(this.analyser); // 链接可视化
      this.AudioBufferSourceNode.start(0, timeline); // 延遲多少秒播放, 從多秒開始播, 播幾秒
      console.log(this.AudioBufferSourceNode );
      this.startPlayTime = this.audioCtx.currentTime; // 保存开始的时间
      this.skipPlayTime = timeline || 0; // 跳过的时间
    },
    changeVoices (e) { // 改變音量大小
       this.voicesSize = this.gainNode.gain.value = e.offsetX / e.target.offsetWidth;
    },
    // 初始化
    initAudio () {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioCtx.createAnalyser(); // 可视化处理模块
      this.gainNode = this.audioCtx.createGain(); // 音频处理模块
      this.analyser.fftSize = 16*(2**this.num); // 可視化柱子數量
      this.gainNode.connect(this.audioCtx.destination); // 实例链接到音频处理
      console.log('柱子數量:', 8*(2**this.num))
    },
    // 點擊列表 
    clickAudioList (name) {
      this.selectAudio = name;
      if (this.isPlay) {
        // this.AudioBufferSourceNode.onended = () => {};
        this.AudioBufferSourceNode.stop();
        this.clickStart();

      }
    },
    //
    decodeAudioData (data) {
      return new Promise((resolve, reject) => {
        this.audioCtx.decodeAudioData(data, (buffer) => {
          this.map3Buffer = buffer;
          this.audioCache[this.selectAudio] = buffer;
          this.duration = Math.round(buffer.duration);
          // this.runTime = this.duration;
          resolve();
          console.log('加載結束', buffer);
        }, function(e){
          reject("Error with decoding audio data" + e.err)
        });
      })
    }
  },
}
</script>
<style lang='scss' scoped>
.audioPlayer {
  width: 1080px;
  height: 100%;
  position: relative;
  .visualization {
    width: 100%;
    height: 500px;
    background: url('../static/29.jpg') no-repeat top / cover;
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    .bar {
      width: 10px;
      transition: height 100ms;
      // height: 100%;
      background: linear-gradient(0deg, #d2f53662, #75fcb896, #e999,#fff9);
      // background: rgba(117, 252, 184, 0.589);
    }
  }
  .ctrl {
    height: 100px;
    width: 100%;
    background: turquoise;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .play, .pause {
      height: 80px;
      width: 80px;
    }
    .play {
      background: url(@src/assets/image/play.png) no-repeat center / 100%;
    }
    .pause {
      background: url(@src/assets/image/pause.png) no-repeat center / 100%;
    }
    .time {
      color: #fff;
      font-size: 24px;
    }
    .timeline {
      width: 50%;
      height: 10px;
      background: cornflowerblue;
      .timelineLength {
        pointer-events: none;
        height: 100%;
        width: 0;
        background: crimson;
      }
    }
    
    .voices {
      width: 100px;
      height: 10px;
      background: #eac;
      position: relative;
      .voicesBar {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 10px;
        height: 20px;
        background: darkmagenta;
      }
    }
  }
  .list {
    position: absolute;
    left: 100%;
    top: 0;
    width: 500px;
    > div {
      // height: 50px;
      padding: 10px 20px;
      box-sizing: border-box;
      font-size: 16px;
      &.active {
        color: #fff;
        background: darkmagenta;
      }
    }
  }
}
</style>
