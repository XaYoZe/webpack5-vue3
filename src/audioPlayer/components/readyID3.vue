<template>
    <div class="readyID3">
        <img :src="pic" alt="">
    </div>
</template>
<script>
// https://id3.org/id3v2.3.0#sec3.3.1
export default {
    data () {
        return {
            pic: '',
            frameId: {
                'TEXT': '歌词作者',
                'WXXX': 'URL链接(URL)',
                'TOPE': '原艺术家',
                'TDAT': '日期',
                'TPE2': '乐队',
                'TPE4': '翻译（记录员、修改员）',
                'USLT': '歌词',
                'TIT1': '内容组描述',
                'TIT3': '副标题',
                'TBPM': '每分钟节拍数',
                'TDLY': '播放列表返录',
                'TFLT': '文件类型',
                'TENC': '编码',
                'TCOP': '版权(Copyright)',
                'TCOM': '作曲家',
                'TPE3': '指挥者',
                'TPE1': '艺术',
                'TYER': '年代',
                'TALB': '专辑',
                'TIT2': '标题',
                'TCON': '流派（风格）',
                'COMM': '注释相当于Comment',
                'TRCK': 'D3v1的音轨（曲号）',
                'TIME': '时间',
                'TKEY': '最初关键字',
                'TLEN': '长度',
                'TOAL': '原唱片集',
                'TOLY': '原歌词作者',
                'TOWM': '文件所有者（许可证者）',
                'TPUB': '发行人',
                'TRSN': 'Intenet电台名称',
                'TSIZ': '大小',
                'TSSE': '编码使用的软件（硬件设置）',
                'AENC': '音频加密技术',
                'UFID': '唯一的文件标识符',
                'TLAN': '语言',
                'TMED': '媒体类型',
                'TOFN': '原文件名',
                'TORY': '最初发行年份',
                'TPOS': '作品集部分',
                'TRDA': '录制日期',
                'TRSO': 'Intenet电台所有者',
                'TSRC': 'ISRC（国际的标准记录代码）',
                'APIC':  '附图'
            },
            picType: {
                [0x00]: '其他',
                [0x01]: '32x32 像素“文件图标”（仅限 PNG）',
                [0x02]: '其他文件图标',
                [0x03]: '封面（正面）',
                [0x04]: '封面（背面）',
                [0x05]: '宣传单页',
                [0x06]: '媒体（例如 CD 的标签面）',
                [0x07]: '首席艺术家/首席表演者/独奏者',
                [0x08]: '艺术家/表演者',
                [0x09]: '导体',
                [0x0A]: '乐队/管弦乐队',
                [0x0B]: '作曲家',
                [0x0C]: '作词/文字作者',
                [0x0D]: '录制地点',
                [0x0E]: '录音期间',
                [0x0F]: '演出期间',
                [0x10]: '电影/视频屏幕截图',
                [0x11]: '一条颜色鲜艳的鱼',
                [0x12]: '插图',
                [0x13]: '乐队/艺术家标识',
                [0x14]: '出版商/工作室标识',
            }

        }
    },
    mounted () {
        console.log('111');
        // this.loadMp3('/static/光良 - 童话.mp3');
        // 
        this.loadMp3('/static/麦振鸿 - 莫失莫忘(逍遥叹 演奏曲).mp3');

    },
    methods: {
        loadMp3 (url) {
            fetch(url).then(res => res.arrayBuffer()).then(res => {
                this.checkData(res);
                // a.slice(4, 7).forEach(item => {
                //     text += String.fromCharCode(item);
                // })
            })

        },
        // 數組轉數值
        arrToNum (arr) {
            if (!arr.length) return 0;
            let str = ''
            arr.forEach(item => {
                str += item.toString(2).padStart(8, 0);
            })
            return Number(`0b${str}`);
        },
        // 數組轉數值
        arrToChart (arr, type) {
            if (!arr.length) return '';
            if (type === 1) {
                let str = '';
                for(let i = 0; i < arr.length; i+=2) {
                    str += String.fromCharCode(this.arrToNum([arr[i+1], arr[i]]));
                }
                return str
            }
            return arr.reduce((p, n, i) => (i === 1 ? String.fromCodePoint(p) : p) + String.fromCodePoint(n));
        },
        // 查找數組中值的索引
        findIndex (arr, val, start, end = Infinity) {
            return arr.findIndex((item, i) => i > start && item === val && i < end)
        },
        checkHeader (buffer) {
                let index = 0;
                /*必须为"ID3"否则认为标签不存在*/ 
                let header = this.arrToChart(buffer.slice(index, index += 3));
                /*版本号ID3V2.3就记录3*/ 
                let ver = buffer[index++];
                /*副版本号此版本记录为0*/ 
                let revison = buffer[index++];
                /*存放标志的字节，这个版本只定义了三位*/ 
                // abc00000 
                // a -- 表示是否使用不同步
                // b -- 表示是否有扩展头部
                // c -- 表示是否为测试标签
                let flag = buffer[index++].toString(2);
                // 有拓張標頭
                let hasExtendedHeader = Number(flag[1]) === 1;

                /*标签大小，包括标签头的10个字节和所有的标签帧的大小*/ 
                let size = buffer.slice(index, index+= 4).reduce((p, n, i) => (i === 1 ? p.toString(2).padStart(7, 0) : p) + n.toString(2).padStart(7, 0));
                console.log(`類型:${header}v2.${ver}.${revison}`,`標識:${flag}`, `拓展標頭: ${hasExtendedHeader}` , `標籤信息大小: ${ (Number(`0b${size}`) / 1024**1).toFixed(2) }kb`);

                if (hasExtendedHeader) {
                    let ExtendedHeaderSize = this.arrToNum(buffer.slice(index, index+=4));
                    let ExtendedHeaderFlag = this.arrToNum(buffer.slice(index, index+=2)).toString(2).padStart(8)[0];
                    let paddingSize = this.arrToNum(buffer.slice(index, index+=4))
                    index += paddingSize;
                }
                return {
                    haderEndIndex: index,
                    totalFrameSize: Number(`0b${size}`) - 10
                };
        },
        checkFrame (buffer, {haderEndIndex, totalFrameSize}) {
            let index = haderEndIndex;
            let total = totalFrameSize;
            let frameArray = buffer.slice(index, index + total);
            console.log(frameArray);
            for (let i = 0; i <= total;) {
                let frameID  = this.arrToChart(frameArray.slice(i, i += 4));
                let frameSize = this.arrToNum(frameArray.slice(i, i += 4));
                let frameFlag = this.arrToNum(frameArray.slice(i, i += 2));
                let frameData = frameArray.slice(i, i += frameSize);
                console.log(` 索引: ${i}\n`,`標籤: ${this.frameId[frameID]}\n`, `類型: ${frameID}\n`, `長度: ${frameSize}\n`, `標識: ${frameFlag.toString(2).padStart(8, 0)}\n`, frameData);
                // 文本格式
                if (frameID[0] === 'T') {
                    let dataIndex = 0;
                    // 編碼
                    let encoding = frameData[dataIndex++];
                    // #fffe #feff Unicode字符串
                    let unicode = frameData.slice(dataIndex, dataIndex += 2);
                    let text = this.arrToChart(frameData.slice(3),  encoding);
                    // console.log(' 數據:', text);
                // 圖片
                } else if (frameID === 'APIC') {
                    // 數據索引
                    let dataIndex = 0;
                    // 0 索引
                    let zeroIndex = 0;
                    let encoding = frameData[dataIndex++];
                    // MIME 类型 0結尾
                    let mineEndIndex = zeroIndex = this.findIndex(frameData, 0, zeroIndex);
                    let mineType = this.arrToChart(frameData.slice(dataIndex, dataIndex = mineEndIndex));
                    // 跳過0
                    dataIndex++;

                    let picType = frameData[dataIndex++];
                    let desEndIndex = zeroIndex = this.findIndex(frameData, 0, zeroIndex);
                    let desArr = frameData.slice(dataIndex, dataIndex = desEndIndex);
                    let des = this.arrToChart(desArr, encoding);
                    // 跳過0
                    dataIndex++;

                    let picData = frameData.slice(dataIndex);
                    let base64Pic = ``;
                    picData.forEach(item => {
                        base64Pic += String.fromCharCode(item);
                    });
                    this.pic = `data:${mineType};base64,${window.btoa(base64Pic)}`;
                    // dataIndex += desLength;
                    // console.log(` MINE類型:${mineType}\n`, `圖片類型:${this.picType[picType]}\n`, `圖片描述: ${des}`);
                }
                console.log('----------------');
                //
                // if ()
            }
        },
        checkData (data) {
            let buffer = new Uint8Array(data);
            let headerData = this.checkHeader(buffer);
            console.log(data);
            this.checkFrame(buffer, headerData);
        },
        strToArr (str) {
            let arr = [];
            for (let i = 0; i< str.length; i++) {
                let newStr = str[i].charCodeAt(0).toString(2).padStart(16, 0);
                arr.push(Number(`0b${newStr.slice(0, 8)}`), Number(`0b${newStr.slice(8)}`));
            }
            console.log(arr);
        }
    }
}
</script>
