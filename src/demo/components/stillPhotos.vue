<template>
  <div class="stillPhotos">
    <div class="left">
      <video ref="video"></video>
      <div class="btn" @click="clickBtn">拍</div>
    </div>
    <div class="right">
      <canvas ref="canvas"></canvas>
    </div>
    <!-- <img :src="imgData"> -->
  </div>
</template>
<script>
export default {
  data () {
    return {
      video: null,
      canvas: null,
      streaming: false,
      imgData: null,
      img: new Image()
    }
  },
  mounted () {
    console.log(11122);
    this.video = this.$refs.video;
    this.canvas = this.$refs.canvas;
    this.context = this.canvas.getContext('2d');
    // 获取设备摄像头权限
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
      // srcObject 实时流
      this.video.srcObject = stream;
      this.record(stream);
      this.video.addEventListener('canplay', (ev) => {
        if (!this.streaming) {
          let width = this.video.offsetWidth;
          let height = this.video.offsetHeight;
          this.canvas.width = width;
          this.canvas.height = height;
          this.streaming = true;
        }
      }, false);
      this.$refs.video.play();
    })
    .catch(function(err) {
      console.log("An error occured! " + err);
    });
  },
  methods: {
    record (stream) {
      if (!this.mediaRecorder) {
        // 视频录制
        this.mediaRecorder = new MediaRecorder(stream, {
        audioBitsPerSecond : 128000, // 音频码率
        videoBitsPerSecond : 100000, // 视频码率
        mimeType : 'video/webm;codecs=h264' // 编码格式
        })
        // 事件
        console.log(this.video, this.mediaRecorder);
        this.mediaRecorder.ondataavailable =  (e) => {
          // 下载视频
          var blob = new Blob([e.data], { 'type' : 'video/mp4' })
          let a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = `test.mp4`
          a.click()
        }
      // 开始录制
        this.mediaRecorder.start();
      }
    },
    clickBtn (event) {
      this.clearPhoto();
      this.cupImg();
      this.imgData = this.canvas.toDataURL('image/png');
      // 停止录制
      this.mediaRecorder.stop();
      // requestAnimationFrame(this.clickBtn);
      event.preventDefault();
    },
    cupImg () {
      this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    },
    clearPhoto () {
      this.context.fillStyle = '#AAA';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
</script>
<style scoped lang="scss">
.stillPhotos {
  width: 800px;
  height: 400px;
  display: flex;
  > div {
    width: 50%;
  }
  .left {
    background: #ead;
    height: 100%;
    position: relative;
    video {
      width: 100%;
    }
    .btn {
      padding: 10px 20px;
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      background: cadetblue;
    }
  }
  .right {
    background: #bad;
    height: 100%;
  }
}
</style>