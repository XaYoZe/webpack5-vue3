// 從設備獲取屏幕和聲音
<template>
  <div class="stillPhotos">
    <div class="row">
      <video ref="video" muted="muted" v-show="false"></video>
      <visualization :list="arr" ref="visualization"></visualization>
    </div>
    <div class="row">
      <div class="btn" @click="clickPlay">{{ streaming ? '結束' : '開始' }}</div>
      <div class="btn" @click="clickRecord">{{ recording ? '停止' : '錄製' }}</div>
    </div>
    <div class="row">
    </div>
  </div>
</template>
<script>
import visualization from "./visualization";
export default {
  components: { visualization },
  data() {
    return {
      video: null,
      streaming: false,
      mediaStream: null,
      recording: false,
      arr: [],
      level: 3, // 可視化柱子等級
    };
  },
  mounted() {
    console.log(11122);
    this.video = this.$refs.video;
    // this.canvas = this.$refs.canvas;
    // this.context = this.canvas.getContext("2d");
  },
  methods: {
    getDevicesScreen() {
      // 获取设备權限
      navigator.mediaDevices
        ?.getDisplayMedia({
          video: {
            cursor: "always",
          },
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            sampleRate: 44100,
          },
        })
        .then((mediaStream) => {
            this.mediaStream = mediaStream;
          //   srcObject 实时流
          this.video.srcObject = mediaStream;
          this.video.addEventListener(
            "playing",
            (ev) => {
                this.streaming = true;
                this.video.height = this.video.offsetWidth / this.video.videoWidth * this.video.videoHeight;
                console.log(this.$refs.canvas);
                this.visualization();
            },
            false
          );
          this.$refs.video.play();
        })
        .catch(function (err) {
          console.log("An error occured! " + err);
        });
    },
    visualization () {
          // 創建音頻對象
          var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          // 創建可視化處理
          var analyser = audioCtx.createAnalyser();
          analyser.fftSize = 2**(5 + this.level); // 可視化柱子數量[32, 32768]
          // 創建音源
          var source = audioCtx.createMediaStreamSource(this.mediaStream);
          source.connect(analyser);
          console.log(analyser)
          var _this = this;
          var anime = () => {
            var arr = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(arr);
            _this.arr = arr;
            if (!_this.streaming) return;
            requestAnimationFrame(anime);
          }
          requestAnimationFrame(anime);
    },
    // 開始錄製
    record() {
      if (!this.mediaRecorder) {
        // 视频录制
        this.mediaRecorder = new MediaRecorder(this.mediaStream, {
          audioBitsPerSecond: 128000, // 音频码率
          videoBitsPerSecond: 1000000, // 视频码率
          mimeType: "video/webm;codecs=h264", // 编码格式
        });
        // 事件
        this.mediaRecorder.ondataavailable = (e) => {
          // 下载视频
          var blob = new Blob([e.data], { type: "video/mp4" });
          let a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `test.mp4`;
          a.click();
        };
      }
      // 开始录制
      this.mediaRecorder.start();
        this.recording = true;
    },
    clickPlay () {
        if (this.streaming) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.streaming = false;
            console.log('停止播放')
        } else {
            this.getDevicesScreen();
        }
    },
    clickRecord (event) {
        if (this.recording) {
            // 停止录制
            this.mediaRecorder.stop();
            this.recording = false;
        } else {
            this.record();
        }

      // requestAnimationFrame(this.clickBtn);
      event.preventDefault();
    }
  },
};
</script>
<style scoped lang="scss">
.stillPhotos {
    width: 100%;
  .row {
    width: 100%;
    display: flex;
  }
  .btn {
    width: 150px;
    height: 50px;
    margin: 0 30px;
    background: #cae;
    border-radius: 25px;
    line-height: 50px;
    text-align: center;
    color: #fff ;
  }
  video, canvas {
    width: 50%;
  }
  canvas {
    height: 100%;
  }
  //   .right {
  //     background: #bad;
  //     height: 100%;
  //   }
}
</style>