// https://id3.org/id3v2.3.0
import BitReader from './utils';
export default class Mp3Info {
    frameId = {
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
        'COMM': '注释',
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
        'APIC': '附图',
        'TXXX': '自定義信息'
    }
    picType = {
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
    // uint8 數組
    uint8Array = null;
    // uint8 讀取索引
    sliceIndex = 0;

    constructor(debug) {
        this.debug = debug;
        window.arrToNum = this.arrToNum;
        window.arrToStr = this.arrToStr;
    }
    // 16進制數組轉數值
    //
    arrToNum(data) {
        let length = data.length;
        if (!length) return data;
        let num = 0;
        for (let i = 0; i < length; i++) {
            // 將數組左移後相加, 16進制每次移動8位
            num += data[i] << 8 * (length - 1 - i);
        }
        return num
    }
    // 16進制數組轉字符串
    arrToStr(arr, type) {
        if (!arr.length) return '';
        if (type === 1) {
            let str = '';
            for (let i = 0; i < arr.length; i += 2) {
                str += String.fromCharCode(this.arrToNum([arr[i + 1], arr[i]]));
            }
            return str
        }
        return arr.reduce((p, n, i) => (i === 1 ? String.fromCodePoint(p) : p) + String.fromCodePoint(n));
    }
    // 10進制轉其他進制
    DEC2Other (num, radix = 2, length = 0) {
        return num.toString(radix).padStart(length, 0);
    }
    
    /**
     * 在數據裡找找結束標識
     * @param {*} flag 結束標識
     * @param {*} start 開始位置
     * @param {*} end 結束位置
     * @returns {number} 相對開始得索引, 未找到-1
     */
    findEndFlagIndex (flag, start, end) {
        let seachArr = flag.length ? flag : [flag];
        let startIndex = start || this.sliceIndex;
        let endIndex = end || this.uint8Array.length;
        let index = startIndex;
        while (this.uint8Array[index] !== undefined) {
            let allTrue = seachArr.every((val, i) => val === this.uint8Array[index + i]);
            // console.log(this.uint8Array[index]);
            // 找到拋出索引
            if (allTrue) {
                return index - startIndex;
            }
            // 超過限制還沒有找到, 退出
            if (index > endIndex) {
                return -1
            }
            index++;
        }
        return -1;
    }
    // 讀取buffer信息 16進制數組
    readyInfo (buffer) {
        this.uint8Array = buffer;
        this.sliceIndex = 0;
        return this.checkID3(this.uint8Array);
    }
    /**
     * 截取當前數據段
     * @param {*} length 截取長度
     * @param {*} type 轉換類型
     * @param {*} encoding 文本編碼
     * @param {*} skipIndex 跳過索引
     * @returns 截取的數據片段, 文本或數值
     */
    sliceUintData (length, type, encoding, skipIndex = 0) {
        // if (!length) return [];
        let sliceData = this.uint8Array.slice(this.sliceIndex, this.sliceIndex + length);
        this.sliceIndex += length;
        switch (type) {
            case 'string':
                sliceData = this.arrToStr(sliceData, encoding);
                break;
            case 'number': 
                sliceData =  this.arrToNum(sliceData);
                 break;
            default:
                length === 1 && (sliceData = sliceData[0]);
                break;
        }
        this.sliceIndex += skipIndex;
        return sliceData;
    }
    checkID3 () {
        let bitReadery = new BitReader(this.uint8Array);
        // console.log(bitReadery.read(3).toStr(), '1-----');
        let id3Info = {
            header: {},
            frameSize: 0,
            frames: []
        };
        /*必须为"ID3"否则认为标签不存在*/ 
        let identifier = bitReadery.read(3).toStr();
        if (identifier === 'ID3') {
            /* 版本号ID3V2.3就记录3*/ 
            let ver = bitReadery.read(1).toNum();
            /*副版本号此版本记录为0*/ 
            let revison = bitReadery.read(1).toNum();
            id3Info.version = `2.${ver}.${revison}`;
            console.log(`版本: v2.${ver}.${revison}`);
            /*存放标志的字节，这个版本只定义了三位*/ 
            // abc00000 
            // a -- 表示是否使用不同步
            // b -- 表示是否有扩展头部
            // c -- 表示是否为测试标签
            let [unsynchronisation, extendedHeader, experimentalIndicator]  = this.DEC2Other(bitReadery.read(1), 2, 8);
            id3Info.header = {
                unsynchronisation: !!Number(unsynchronisation),
                extendedHeader: !!Number(extendedHeader),
                experimentalIndicator: !!Number(experimentalIndicator)
            }
            console.log(`使用不同步: ${ !!Number(unsynchronisation) }`, `有扩展头部: ${ !!Number(extendedHeader) }`, `为测试标签: ${ !!Number(experimentalIndicator) }`);
            /*标签大小，不包括标签头的10个字节的所有标签帧的大小*/ 
            // 二進制去最高位後拼接計算
            let totalFrame = Number('0b' + Array.from(bitReadery.read(4) , (n) => this.DEC2Other(n, 2, 8).slice(1)).join('')) + 10;
            id3Info.frameSize = totalFrame;
            console.log(`標籤信息大小: ${ (totalFrame / 1024).toFixed(2) }kb`);
            // 有拓展標頭
            if (!!Number(extendedHeader)) {
                // 拓展標頭大小
                let ExtendedHeaderSize = bitReadery.read(4).toNum();
                // 
                let ExtendedHeaderFlag = bitReadery.read(2).toNum().toString(2).padStart(8)[0];
                let paddingSize = bitReadery.read(4).toNum();
                id3Info.header.extendedHeader = {
                    ExtendedHeaderSize,
                    ExtendedHeaderFlag,
                    paddingSize
                }
                console.log(`拓展標頭大小: ${ ExtendedHeaderSize }kb`, `拓展標頭標識: ${ ExtendedHeaderFlag }kb`, `拓展標頭填充大小: ${paddingSize}`);
            }

            while (bitReadery.index < totalFrame) {
                // 幀開始索引
                let frameStartIndex = bitReadery.index;
                let frameId = bitReadery.read(4).toStr();
                // 找不到標籤
                if (!this.frameId[frameId]) {
                    console.log('結束\n', frameId, bitReadery.read(totalFrame - bitReadery.index));
                    console.log(bitReadery.findIndex(255), bitReadery.read(500));
                    break;
                }
                // 幀大小
                let frameSize = bitReadery.read(4).toNum();
                // 幀標識
                let frameFlag = bitReadery.read(2).toNum();
                // 幀結束索引
                let frameEndIndex = frameStartIndex + frameSize + 10; // 起始索引 + 幀大小 + 10字節幀頭
                // 儲存幀數據
                let frameData = {
                    frameId,
                    frameName: this.frameId[frameId],
                    frameSize,
                    frameFlag,
                    frameStartIndex,
                    frameEndIndex
                };
                
                console.log(` 索引: [${frameStartIndex}, ${frameEndIndex})\n`,`標籤: ${this.frameId[frameId]}\n`, `類型: ${frameId}\n`, `長度: ${frameSize}\n`, `標識: ${frameFlag.toString(2).padStart(8, 0)}\n`);

                if (frameId === 'TXXX') { // 自定義文本內容標籤
                    let textEncoding = bitReadery.read(1).toNum();
                    let descriptionSize = bitReadery.findIndex(0x00);
                    let description = bitReadery.read(descriptionSize, 1).toStr(textEncoding);
                    let text = bitReadery.read(frameEndIndex - bitReadery.index).toStr(textEncoding);
                    frameData.description = description;
                    frameData.text = text;
                    console.log(` ${description}: ${text}`);
                } else if (frameId[0] === 'T') { // 文本內容標籤
                    let textEncoding = bitReadery.read(1).toNum();
                    let text = bitReadery.read(frameSize - 1);
                    frameData.textEncoding = textEncoding;
                    frameData.text = text.toStr(textEncoding);
                    console.log(` 編碼: ${textEncoding}\n 源碼: ${text}\n 文本: ${text.toStr(textEncoding)}`);
                } else if (frameId === 'APIC') {  //  圖片內容標籤
                    let textEncoding = bitReadery.read(1).toNum();
                    frameData.textEncoding = textEncoding;
                    // MIME 类型 結尾標識為0
                    let mineTypeSize = bitReadery.findIndex(0x00);
                    let mineType = bitReadery.read(mineTypeSize, 1).toStr(textEncoding);
                    frameData.mineType = mineType;
                    let picType = bitReadery.read(1).toNum();
                    frameData.picType = picType;
                    // console.log(textEncoding);
                    // 圖片描述 結尾標識為0
                    let desSize = bitReadery.findIndex(0x00);
                    let description  = bitReadery.read(desSize, 1).toStr(textEncoding);;
                    frameData.description = description;
                    let picSize = frameEndIndex - bitReadery.index;
                    let picData = bitReadery.read(picSize);
                    frameData.picData = picData;
                    frameData.size = picSize;
                    let url = window.URL.createObjectURL(new Blob([picData], {type: mineType}));
                    frameData.url = url;
                    console.log(` 圖片類型: ${this.picType[picType]}\n`,`圖片格式:${mineType}\n`,`圖片描述: ${description}\n`, `圖片鏈接:${url}`);
                    // 轉base64
                    // let base64Pic = ``;
                    // picData.forEach(item => {
                    //     base64Pic += String.fromCharCode(item);
                    // });
                    // let pic = `data:${mineType};base64,${window.btoa(base64Pic)}`;
                    // 轉鏈接
                    let img = new Image();
                    img.src = url;
                    document.body.style.backgroundImage = `url(${url})`;
                    
                } else if (frameId === 'COMM') { // 注释
                    // 文本編碼
                    let textEncoding = bitReadery.read(1).toNum();
                    frameData.textEncoding = textEncoding;
                    // 語言
                    let language = bitReadery.read(3).toStr();
                    frameData.language = language;
                    // 描述結束長度, 標識0x00
                    let descripSize = bitReadery.findIndex(0x00);
                    // 描述
                    let descrip = bitReadery.read(descripSize, 1).toStr(textEncoding);
                    frameData.descrip = descrip;
                    // 內容 網易雲 aes-128-ecb 解碼 #14ljk_!\]&0U<'(
                    let text = bitReadery.read(frameEndIndex - bitReadery.index).toStr(textEncoding);
                    
                    frameData.text = text;
                    console.log(textEncoding, language, descrip, text, bitReadery.bitCache);
                } else {
                    console.log('其他數據未處理', bitReadery.read(frameSize));
                }
                id3Info.frames.push(frameData);
            }

        } else {
           console.log(`類型:${identifier}`);
        }
        // this.checkMp3Info(id3Info.frameSize);
        // this.checkID3V1();
        return id3Info;
    }

    // 對src進行取值
    sliceInfo (src) {
        let index = 0;
        console.log(src)
        return (size) => {
            let res = src.slice(index, index + size)
            index += size;
            return res;
        }
    }
    checkMp3Info (startIndex) {
        this.sliceIndex = 0;
        this.sliceUintData(0, undefined, undefined, startIndex);
        let mp3Header = this.sliceUintData(4);
        console.log(mp3Header);
        // this.sliceIndex = this.findEndFlagIndex(255);
        let sliceText = this.sliceInfo(Array.from(mp3Header , (n) => this.DEC2Other(n, 2, 8)).join(''));
        // 同步信息
        let syncInfo = sliceText(11);
        if (syncInfo !== ''.padStart(11, 1)) {
            let index = this.findEndFlagIndex(255);
            console.log('非幀頭, 從新查找');
            console.log(index, this.sliceUintData(index))
            this.checkMp3Info(this.sliceIndex);
            return;
        }
        // 版本
        let version = sliceText(2);
        let versionMap = {'00': 'MPEG 2.5', '01': '未定义', '10': 'MPEG 2', '11': 'MPEG 1'};
        // 層
        let layer = sliceText(2);
        let layerMap = {'00': '未定义', '01': 'Layer 3', '10': 'Layer 2', '11': 'Layer 1'};
        let vlMap = {'1111': 0, '1110': 1, '1101': 2, '0011': 3, '0010': 4, '0001': 5, '1011': 3, '1010': 4,'1001': 5 }
        // crc校驗
        let crcCheck = Number('0b' + sliceText(1));
        let crcCheckMap = ['校驗', '不校驗'];
        // 位率
        let bitrateIndex = sliceText(4);
        let bitrateMap = 
        {
            '0000': ['free', 'free', 'free', 'free', 'free', 'free', ],
            '0001': ['32','32','32','32(32)','32(8)','8(8)'] ,
            '0010': ['64','48','40','64(48)','48(16)','16(16)'],
            '0011': ['96','54','48','96(56)','56(24)','24(24)'],
            '0100': ['128','64','56','128(64)','64(32)','32 (32)'],
            '0101': ['160','80','64','160(80)','80(40)','64 (40)'],
            '0110': ['192','96','80','192(96)','96(48)','80 (48)'],
            '0111': ['224','112','96','224(112)','112(56)','56 (56)'],
            '1000': ['256','128','112','256(128)','128(64)','64 (64)'],
            '1001': ['288','160','128','288(144)','160(80)','128 (80)'],
            '1010': ['320','192','160','320(160)','192(96)','160 (96)'],
            '1011': ['352','224','192','352(176)','224(112)','112 (112'],
            '1100': ['384','256','224','384(192)','256(128)','128 (128)'],
            '1101': ['416','320','256','416(224)','320(144)','256 (144)'],
            '1110': ['448','384','320','448(256)','384(160)','320 (160)'],
            '1111': ['bad','bad','bad','bad','bad','bad']
        }
        // 採樣率
        let samplingFrequency = sliceText(2);
        let samplingMap = {
            '00': {'11': '44.1kHz', '10': '22.05kHz', '00': '11.025kHz'},
            '01': {'11': '48kHz', '10': '24kHz', '00':'12kHz'},
            '10': {'11': '32kHz', '10': '16kHz','00': '8kHz'},
            '11': {'11': '未定义' , '10': '未定义' , '00': '未定义'},
        };
        // 帧长调节
        let padding = sliceText(1);
        let paddingMap = {'0': '无需调整', '1': '调整'}
        // 保留字
        let private1 = sliceText(1);
        // 聲道
        let mode = sliceText(2);
        let modeMap = {'00': '立体声Stereo', '01': 'Joint Stereo', '10': '双声道', '11': '单声道'}
        // 扩充模式 当声道模式为01是才使用
        let extension = sliceText(2);
        let extensionMap = {
            '00': '强度立体声: 關, MS立体声: 關',
            '01': '强度立体声: 開, MS立体声: 關',
            '10': '强度立体声: 關, MS立体声: 開',
            '11': '强度立体声: 開, MS立体声: 開',
        }
        // 版权
        let copyright = sliceText(1);
        let copyrightMap = {0: '不合法', 1: '合法'};
        // 原版标志
        let original = sliceText(1);
        let originalMap = {0: '非原版', 1: '原版'};
        // 强调模式
        let emphasis = sliceText(2);
        let emphasisMap = {'00': '未定义', '01': '50/15ms', '10': '保留', '11': 'CCITT J.17'}
        console.log(
            ` 同步信息: ${syncInfo}\n`,
            `版本: ${versionMap[version]}\n`,
            `層: ${layerMap[layer]}\n`,
            `crc校驗: ${crcCheckMap[crcCheck]}\n`,
            `位率: ${bitrateMap[bitrateIndex][vlMap[version + layer]]}kbps\n`,
            `採樣率: ${samplingMap[samplingFrequency][version]}\n`,
            `帧长调节: ${paddingMap[padding]}\n`,
            `保留字: ${private1}\n`,
            `聲道: ${modeMap[mode]}\n`,
            `扩充模式: ${extensionMap[extension]}\n`,
            `版权: ${copyrightMap[copyright]}\n`,
            `原版标志: ${originalMap[original]}\n`,
            `强调模式: ${emphasisMap[emphasis]}\n`,
        )
    }
    checkID3V1 () {
        this.sliceIndex = 0;
        this.sliceUintData(this.uint8Array.length - 128);
        let flag = this.sliceUintData(3, 'string');
        if (flag === 'TAG') {
            console.log('ID3V1');
            let name = this.sliceUintData(30, 'string');
            let author = this.sliceUintData(30, 'string');
            let album　 = this.sliceUintData(30, 'string');
            let year = this.sliceUintData(4, 'string');
            let comment = this.sliceUintData(28, 'string');
            let reserved = this.sliceUintData(1, 'string');
            let track = this.sliceUintData(1, 'string');
            let genre  = this.sliceUintData(1, 'string');
            console.log(name, '\n' , author, '\n', album, '\n', year, '\n', comment, '\n', track,  '\n', reserved, '\n', genre);
        }
    }
}