<template>
    <div class="readyID3">
        <div class="dropDiv" @drop.prevent="drop" @dragover.prevent>拖動文件到這裡</div>
        <div class="info">
            <div class="row">
               <div class="key">幀大小:</div><div class="value">{{audioData.frameSize}}字節</div>
            </div>
            <div class="row" v-for="frame in audioData.frames" :key="frame.frameId">
                <template v-if="frame.frameId === 'APIC'">
                    <div  class="key">{{ frame.frameName }}:</div>
                    <div class="value">
                        <img :src="frame.url">
                        <p>類型: {{ frame.mineType }}</p>
                        <p>大小: {{ (frame.size / 1024).toFixed(1) }}kb</p>
                    </div>
                </template>
                <template v-else-if="frame.frameId === 'TXXX'">
                  <div  class="key">自定義標籤{{ frame.description }}:</div> <div class="value">{{ frame.text }}</div>
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
// https://id3.org/id3v2.3.0#sec3.3.1
export default {
    data () {
        return {
            audioInfo: new audioInfo(),
            pic: '',
            audioData: {}
        }
    },
    mounted () {
        this.audioInfo.readyInfoFromUrl('/static/麦振鸿 - 莫失莫忘(逍遥叹 演奏曲).mp3').then(res=> {
            console.log(11111, res);
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