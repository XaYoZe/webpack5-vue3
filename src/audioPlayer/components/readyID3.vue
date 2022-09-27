<template>
    <div class="readyID3">
    </div>
</template>
<script>
export default {
    data () {
        return {
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
                'TPE1': '艺术家相当于ID3v1的Artist',
                'TYER': '年代相当于ID3v1的Year',
                'TALB': '专辑相当于ID3v1的Album',
                'TIT2': '标题相当于ID3v1的Title',
                'TCON': '流派（风格）相当于ID3v1的Genre见下表',
                'COMM': '注释相当于Comment',
                'TRCK': 'D3v1的音轨（曲号）相当于ID3v1的Track',
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
        checkData (data) {
                let buffer = new Int8Array(data);
                console.log(data, buffer);
                /*必须为"ID3"否则认为标签不存在*/ 
                let header = buffer.slice(0, 3).reduce((p, n, i) => (i === 1 ? String.fromCharCode(p) : p) + String.fromCharCode(n));
                /*版本号ID3V2.3就记录3*/ 
                let ver = buffer[3];
                /*副版本号此版本记录为0*/ 
                let revison = buffer[4];
                /*存放标志的字节，这个版本只定义了三位*/ 
                let flag = buffer[5];
                /*标签大小，包括标签头的10个字节和所有的标签帧的大小*/ 
                let size = buffer.slice(6, 10).reduce((p, n, i) => (i === 1 ? p.toString(2).padStart(7, 0) : p) + ',' + n.toString(2).padStart(7, 0));
                let frameID  = buffer.slice(10, 16).reduce((p, n, i) => (i === 1 ? String.fromCharCode(p) : p) + String.fromCharCode(n));
                console.log('類型:', header, '版本:',ver, size);
        }
    }
}
</script>
