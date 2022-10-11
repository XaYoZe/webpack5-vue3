<template>
    <div class="readyID3">
        <div class="dropDiv" @drop.prevent="drop" @dragover.prevent>拖動文件到這裡</div>
        <div class="info">
            <div class="row">
               <div class="key">版本:</div><div class="value">{{audioData.version}}</div>
            </div>
            <div class="row">
               <div class="key">頭幀大小:</div><div class="value">{{audioData.frameSize}} bytes</div>
            </div>
            <div class="row" v-for="(frame, index) in audioData.frames" :key="index">
                <template v-if="frame.frameId === 'APIC'">
                    <div  class="key">{{ frame.frameName }}:</div>
                    <div class="value">
                        <img :src="frame.url">
                        <p>類型: {{ frame.picType }}</p>
                        <p>格式: {{ frame.mineType }}</p>
                        <p>大小: {{ (frame.size / 1024).toFixed(1) }}kb</p>
                    </div>
                </template>
                <template v-else-if="frame.frameId === 'TXXX'">
                  <div  class="key">自定義標籤:</div> <div class="value">
                    <p>{{ frame.description }}</p>
                    <p>{{ frame.text }}</p>
                </div>
                </template>
                <template v-else-if="frame.descrip">
                  <div  class="key">注釋:</div> <div class="value"><p v-if="frame.descrip">{{ frame.descrip }}</p><p>{{ frame.text }}</p></div>
                </template>
                <template v-else>
                    <div  class="key">{{ frame.frameName }}: </div><div class="value">{{ frame.text }}</div>
                </template>
            </div>
        </div>
    </div>
</template>
<script>
import audioInfo from '@js/audioInfo';

export default {
    data () {
        return {
            audioInfo: new audioInfo(),
            pic: '',
            audioData: {}
        }
    },
    mounted () {
        this.audioInfo.readyInfoFromUrl('/static/59.【1】Endless Melancholy - We Have Met Before.mp3').then(res=> {
            this.audioData = res;
        });
    },
    methods: {
        // 拖動文件
        async drop (e) {
            e.preventDefault();
            let file = e.dataTransfer.files[0];
            if (/audio\//.test(file.type)) {
                let buffer = await file.arrayBuffer();
                this.audioData = this.audioInfo.readyInfo(buffer);
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.readyID3 {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 50px 0;
    .dropDiv {
        width: 100%;
        height: 200px;
        margin-bottom: 20px;
        border: 1px double #adc;
        outline: none;
        user-select: none;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .info {
        max-width: 100%;
        padding: 0 50px;
        .row {
            display: flex;
        }
        .key {
            width: 200px;
            min-width: 200px;
            flex-shrink: 1;
        }
        .value {
            word-break: break-all;
            margin-bottom: 10px;
        }
    }
}
</style>