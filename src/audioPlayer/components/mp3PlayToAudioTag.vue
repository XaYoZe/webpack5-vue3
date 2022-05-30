<template>
  <div class='mp3Play'>
    <audio
      ref="audio"
      src="/static/Lupins.mp3"
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
       :style="{height: arr[i] && `${(arr[i] / 255)  * 100}%`}"
       ></span>
    </div>
    <div class="currentTime">
      {{ currentTime }}
    </div>
    <!-- <div class="tip" @click="time++">{{ time }}</div> -->
  </div>
</template>
<script>
// 使用浏览器自带audio标签,进行实现可视化, iOS会有兼容问题
export default {
  data () {
    return {
      // src: 'https://www.miyachat.com/resource/mp3/10441495.mp3',
      isPlay: false, // 正在播放
      isLoading: false,
      audio: null, // 储存audio标签
      audioCtx: null, // 
      duration: 0, // 时长
      length: 20, // 可视化柱子数量
      time: 0, // 当前时间
      analyser: null,
      config: { attributes: true, childList: true, subtree: true },
      arr: [],
      index: 0
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
	        // this.analyser.fftSize =  16 * 2;
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

</style>
