<template>
  <div class='mp3Play'>
    <div :class="[isPlay ? 'pause' : 'play']" @click="clickStart('start')"></div>
    <div class="playing"  :class="{run1 : isPlay , loading: isLoading}" ref="playing">
      <span
       class="playing__bar"
       v-for="i in length"
       :key="i"
       :class="['playing__bar' + i]"
       :style="{height: arr[i] && `${(arr[i] / 255)  * 100}%`}"
       ></span>
    </div>
    <div class="currentTime">
      {{ parseInt(currentTime) }}
    </div>
    <div>
    </div>
    <div class="tip" @click="time++">{{ time }}</div>
  </div>
</template>
<script>
// 通过ajax请求音频,使用js来播放音频, iOS可以使用, 缺点: 不能边缓存边播
export default {
  data () {
    return {
      isPlay: false, // 正在播放
      audio: null,
      audioCtx: null,
      duration: 0,
      time:  0, // 播放時長
      length: 20,
      analyser: null,
      config: { attributes: true, childList: true, subtree: true },
      arr: new Array(16).fill(),
      // browser: Browser.getBrowser(), // 判斷瀏覽器
      index: 0,
      map3Buffer: null, // mp3數據
      showTip: true,
      isLoading: false, // 加載動畫
    }
  },
  mounted () {
    // 处理退出页面音频播放问题
    var hidden;
    if (typeof document.hidden !== "undefined") {
      // Opera 12.10 and Firefox 18 and later support
      hidden = "hidden";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
    }
    fetch(new Request(this.src)).then(res =>{
      let audio = new Audio();
      let mediaStream = new MediaStream();
      let reader = res.body.pipeTo(new WritableStream());
      console.log(reader)
      // res.blob().then(res => {
      //   audio.src =  window.URL.createObjectURL(res);
      //   audio.play();
      // })
    //   let audio = new Audio();
    //   Reader.read().then(res => {
    //     audio.src = window.URL.createObjectURL(res);
    //     audio.play();
    //   })
    })
  },
  computed: {
    src () {
      return `${location.origin}${location.pathname.replace('/index.html', '/')}static/Lupins.mp3?t=${window.timestamp}`
    },
    // 当前播放时间
    currentTime () {
      let ts = parseInt(this.time);
      let s = ts % 60;
      let m = Math.floor(ts / 60);
      return `${ m < 10 ? `0${ m }` : m }'${ s < 10 ? `0${ s }` : s }"`
    }
  },
  methods: {
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
          reject({status: xhr.status, des: xhr.response})
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
    getAudioData () {
      this.isLoading = true;
      console.log(this.src);
      this.ajax({
        url: this.src,
        responseType:'arraybuffer'
      }).then((data) => {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512 * 2;
        this.audioCtx.decodeAudioData(data, (buffer) => {
          this.map3Buffer = buffer;
          this.duration = Math.round(buffer.duration);
          this.time = this.duration;
          this.isLoading = false;
          this.clickStart();
          console.log('加載結束');
        }, function(e){"Error with decoding audio data" + e.err});
      }).catch(err => {
        console.log('獲取音頻失敗!', err);
      })
    },
    clickStart () {
      if (!this.map3Buffer) { // 如果沒有音樂
        this.isLoading || this.getAudioData(); // 獲取音樂數據
        return
      }
      if (this.isPlay) { // 正在播放
        this.isPlay = false; // 修改播放狀態
        this.audioCtx.suspend(); // 暫停
        cancelAnimationFrame(this.index); // 清楚動畫定時器
      } else {
        this.showTip = false;
        if (!this.AudioBufferSourceNode) { // 
          this.AudioBufferSourceNode = this.audioCtx.createBufferSource();
          this.AudioBufferSourceNode.onended = () => { // 音樂播放結束觸發
            console.log('結束播放');
            cancelAnimationFrame(this.index); // 清除動畫定時器
            this.arr = new Array(16).fill();
            this.audioCtx.suspend(); // 暫停
            this.time = this.duration;
            this.AudioBufferSourceNode = null;
            this.isPlay = false;
          }
          let gainNode = this.audioCtx.createGain();
          this.AudioBufferSourceNode.buffer = this.map3Buffer;
          gainNode.connect(this.audioCtx.destination);
          this.AudioBufferSourceNode.connect(gainNode);
          this.AudioBufferSourceNode.connect(this.analyser);
          this.AudioBufferSourceNode.start(0);
        }
        this.audioCtx.resume();
        requestAnimationFrame(this.visualization);
        console.log(this.AudioBufferSourceNode);
      }
    },
    // 播放時間改變時觸發
    timeupdate ({target}) {
      this.time = target.currentTime;
    },
    // 获取可视化数据并渲染
    visualization () {
      var arr = new Uint8Array(this.analyser.frequencyBinCount);
      var state = this.audioCtx.state;
      this.analyser.getByteFrequencyData(arr);
      this.arr = arr;
      this.time = this.duration - this.audioCtx.currentTime % this.duration;
      if (state === "running") {
        this.isPlay = true;
      } else {
        this.isPlay = false;
      }
	    this.index = requestAnimationFrame(this.visualization);
    }
  },
}
</script>
<style lang='scss' scoped>
.tip {
  color: aqua;
}
</style>
