<template>
    <div class="readyImage"  @drop.prevent="drop" @dragover.prevent>
        <!-- <div class="dropDiv">拖動文件到這裡</div> -->
        <div class="id3Info">
            <div class="row">
               <div class="key">版本:</div><div class="value">{{ id3V2.version}}</div>
            </div>
            <div class="row">
               <div class="key">頭幀大小:</div><div class="value">{{ id3V2.frameSize}} bytes</div>
            </div>
            <div class="row" v-for="(frame, index) in  id3V2.frames" :key="index">
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
import ImageInfo from '@js/imageInfo';

export default {
    data () {
        return {
            imageInfo: new ImageInfo(),
            pic: '',
            id3V2: {},
            audioData: {}
        }
    },
    mounted () {
        this.imageInfo.readyInfoFromUrl('/static/bg_header_apng.png').then(res=> {
            console.log('音樂信息', res);
        });
    },
    methods: {
        // 拖動文件
        async drop (e) {
            e.preventDefault();
            let file = e.dataTransfer.files[0];
            console.log(file.type);
            if (/image\//.test(file.type)) {
                let buffer = await file.arrayBuffer();
                let {id3} = this.imageInfo.readyInfo(buffer);
                // this.id3V2 = id3?.v2;
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.readyImage {
    min-height: 500px;
    box-sizing: border-box;
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
    .id3Info {
        max-width: 100%;
        padding: 0 50px;
        img {
            width: 100%;
        }
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