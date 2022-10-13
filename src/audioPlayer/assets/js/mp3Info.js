// https://id3.org/id3v2.3.0
import BitReader from './utils';
import { Id3Map, Mp3Map } from './map';
export default class Mp3Info {
    // uint8 數組
    uint8Array = null;
    // uint8 讀取索引
    sliceIndex = 0;
    audioInfo = {
        header: {},
        frameSize: 0,
        frames: []
    };
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
    
    // 讀取buffer信息 16進制數組
    readyInfo (buffer) {
        console.clear()
        this.uint8Array = buffer;
        this.audioInfo = {
            header: {},
            frameSize: 0,
            frames: []
        };
        this.sliceIndex = 0;
        return this.checkID3V2(this.uint8Array);
    }
    checkID3V2 () {
        let bitReadery = new BitReader(this.uint8Array);
        // console.log(bitReadery.read(3).toStr(), '1-----');

        /*必须为"ID3"否则认为标签不存在*/ 
        let identifier = bitReadery.read(3).toStr();
        if (identifier === 'ID3') {
            /* 版本号ID3V2.3就记录3*/ 
            let ver = bitReadery.read(1).toNum();
            let id3Map = Id3Map[ver];
            /*副版本号此版本记录为0*/ 
            let revison = bitReadery.read(1).toNum();
            this.audioInfo.version = `ID3V2.${ver}.${revison}`;
            console.log(`版本: v2.${ver}.${revison}`);
            /*存放标志的字节，这个版本只定义了三位*/ 
            // abc00000 
            // a -- 表示是否使用不同步
            // b -- 表示是否有扩展头部
            // c -- 表示是否为测试标签
            let [unsynchronisation, extendedHeader, experimentalIndicator, footerPresent]  = this.DEC2Other(bitReadery.read(1), 2, 8);
            this.audioInfo.header = {
                unsynchronisation: !!Number(unsynchronisation),
                extendedHeader: !!Number(extendedHeader),
                experimentalIndicator: !!Number(experimentalIndicator),
                footerPresent: !!Number(footerPresent)
            }
            /*标签大小，不包括标签头的10个字节的所有标签帧的大小*/ 
            // 二進制去最高位後拼接計算
            let totalFrame = Number('0b' + Array.from(bitReadery.read(4) , (n) => this.DEC2Other(n, 2, 8).slice(1)).join('')) + 10;
            this.audioInfo.frameSize = totalFrame;
            console.log(`使用不同步: ${ !!Number(unsynchronisation) } \n扩展头部: ${ !!Number(extendedHeader) } \n测试标签: ${ !!Number(experimentalIndicator) }`, `\n幀尾內容: ${ !!Number(footerPresent) }`);
            console.log(`文件大小: ${bitReadery.totalSize} \n標籤信息大小: ${ (totalFrame / 1024).toFixed(2) }kb`);
            // 有拓展標頭
            if (!!Number(extendedHeader)) {
                // 拓展標頭大小
                let ExtendedHeaderSize = bitReadery.read(4).toNum();
                // 
                let ExtendedHeaderFlag = bitReadery.read(2).toNum().toString(2).padStart(8)[0];
                let paddingSize = bitReadery.read(4).toNum();
                this.audioInfo.header.extendedHeader = {
                    ExtendedHeaderSize,
                    ExtendedHeaderFlag,
                    paddingSize
                }
                console.log(`拓展標頭大小: ${ ExtendedHeaderSize }kb \n拓展標頭標識: ${ ExtendedHeaderFlag }kb \n拓展標頭填充大小: ${paddingSize}`);
            }
            if (ver === 4) {
                while (bitReadery.index < totalFrame) {
                    // 幀開始索引
                    let frameStartIndex = bitReadery.index;
                    let frameId = bitReadery.read(4).toStr();
                    // 找不到標籤
                    if (!id3Map.frameId[frameId]) {
                        console.log('非標籤', frameId)
                        // console.log(bitReadery.findIndex(255), bitReadery.read(500));
                        break;
                    }
                    // 幀大小
                    let frameSize = bitReadery.read(4).toNum();
                    // 幀標識
                    let frameFlag = bitReadery.read(2).toNum().toString(2).padStart(16, 0);
                    // 幀結束索引
                    let frameEndIndex = frameStartIndex + frameSize + 10; // 起始索引 + 幀大小 + 10字節幀頭
                    // 儲存幀數據
                    let frameData = {
                        frameId,
                        frameName: id3Map.frameId[frameId],
                        frameSize,
                        frameFlag,
                        frameStartIndex,
                        frameEndIndex,
                        frameType: {
                            tagAlterPreservation: !!Number(frameFlag[0]),
                            fileAlterPreservation: !!Number(frameFlag[1]),
                            readOnly: !!Number(frameFlag[2]),
                            compression: !!Number(frameFlag[7]),
                            encryption: !!Number(frameFlag[8]),
                            groupingIdentity: !!Number(frameFlag[9]),
                        }
                    };
                    
                    console.log(`%c索引: [${frameStartIndex}, ${frameEndIndex}) \n標籤: ${id3Map.frameId[frameId]} \n類型: ${frameId} \n長度: ${frameSize} \n標識: ${frameFlag}\n`, style);
    
                    if (frameId === 'TXXX') { // 自定義文本內容標籤
                        let textEncoding = bitReadery.read(1).toNum();
                        console.log(bitReadery.bitCache);
                        let descriptionSize = bitReadery.findTextEnd(textEncoding);
                        let description = bitReadery.read(descriptionSize).toStr(textEncoding);
                        console.log(bitReadery.bitCache);
                        let text = bitReadery.read(frameEndIndex - bitReadery.index).toStr(textEncoding);
                        console.log(bitReadery.bitCache);
                        frameData.description = description;
                        frameData.text = text;
                        console.log(`%c編碼: ${textEncoding} \n描述: ${description} \n文本: ${text}`, style);
                    } else if (frameId[0] === 'T') { // 文本內容標籤
                        let textEncoding = bitReadery.read(1).toNum();
                        let text = bitReadery.read(frameSize - 1);
                        frameData.textEncoding = textEncoding;
                        frameData.text = text.toStr(textEncoding);
                        console.log(`%c編碼: ${textEncoding} \n源碼: ${text} \n文本: ${text.toStr(textEncoding)}`, style);
                    } else if (frameId === 'APIC') {  //  圖片內容標籤
                        let textEncoding = bitReadery.read(1).toNum();
                        frameData.textEncoding = textEncoding;
                        // MIME 类型 結尾標識為0
                        let mineType = bitReadery.read(bitReadery.findTextEnd(textEncoding)).toStr(textEncoding);
                        let picType = bitReadery.read(1).toNum();
                        // console.log(textEncoding);
                        // 圖片描述 結尾標識為0
                        let description  = bitReadery.read(bitReadery.findTextEnd(textEncoding)).toStr(textEncoding);;
                        let picSize = frameEndIndex - bitReadery.index;
                        let picData = bitReadery.read(picSize);
                        let url = window.URL.createObjectURL(new Blob([picData], {type: mineType}));
                        
                        frameData.description = description;
                        frameData.mineType = mineType;
                        frameData.picType = id3Map.picType[picType];
                        frameData.picData = picData;
                        frameData.size = picSize;
                        frameData.url = url;
                        console.log(`%c圖片類型: ${id3Map.picType[picType]} \n圖片格式:${mineType} \n圖片描述: ${description} \n圖片鏈接:${url}`, style);
                        // 轉base64
                        // let base64Pic = ``;
                        // picData.forEach(item => {
                        //     base64Pic += String.fromCharCode(item);
                        // });
                        // let pic = `data:${mineType};base64,${window.btoa(base64Pic)}`;
                    } else if (frameId === 'COMM') { // 注释
                        // 文本編碼
                        let textEncoding = bitReadery.read(1).toNum();
                        frameData.textEncoding = textEncoding;
                        // 語言
                        let language = bitReadery.read(3).toStr();
                        frameData.language = language;
                        // 描述結束長度, 標識0x00
                        let descripSize = bitReadery.findTextEnd(textEncoding);
                        // 描述
                        let descrip = bitReadery.read(descripSize, 1).toStr(textEncoding);
                        frameData.descrip = descrip;
                        // 內容 網易雲 aes-128-ecb 解碼 #14ljk_!\]&0U<'(
                        let text = bitReadery.read(frameEndIndex - bitReadery.index).toStr(textEncoding);
                        
                        frameData.text = text;
                        console.log(`%c编码：${textEncoding} \n语言：${language} \n描述：${descrip} \n内容：${text}`, style);
                    } else if (frameId === 'UFID') {
                        let text = bitReadery.read(frameSize).toStr();
                        frameData.text = text
                        console.log(`%c文本:${text}`, style);
                    } else {
                        console.log('其他數據未處理', bitReadery.read(frameSize));
                    }
                    this.audioInfo.frames.push(frameData);
                }
            } else if (ver === 3) {
                while (bitReadery.index < totalFrame) {
                    let color = '#' + Array.from(Array(3), item => Math.ceil(Math.random() * 255).toString(16)).join('');
                    let style = `color: ${color};font-size: 16px;`
                    // 幀開始索引
                    let frameStartIndex = bitReadery.index;
                    let frameId = bitReadery.read(4).toStr();
                    // 找不到標籤
                    if (!id3Map.frameId[frameId]) {
                        console.log('非標籤', frameId)
                        break;
                    }
                    // 幀大小
                    let frameSize = bitReadery.read(4).toNum();
                    // 幀標識
                    let frameFlag = bitReadery.read(2).toNum().toString(2).padStart(16, 0);
                    // 幀結束索引
                    let frameEndIndex = frameStartIndex + frameSize + 10; // 起始索引 + 幀大小 + 10字節幀頭
                    // 儲存幀數據
                    let frameData = {
                        frameId,
                        frameName: id3Map.frameId[frameId],
                        frameSize,
                        frameFlag,
                        frameStartIndex,
                        frameEndIndex,
                        frameType: {
                            tagAlterPreservation: !!Number(frameFlag[0]),
                            fileAlterPreservation: !!Number(frameFlag[1]),
                            readOnly: !!Number(frameFlag[2]),
                            compression: !!Number(frameFlag[7]),
                            encryption: !!Number(frameFlag[8]),
                            groupingIdentity: !!Number(frameFlag[9]),
                        }
                    };
                    
                    console.log(`%c索引: [${frameStartIndex}, ${frameEndIndex}) \n標籤: ${id3Map.frameId[frameId]} \n類型: ${frameId} \n長度: ${frameSize} \n標識: ${frameFlag}\n`, style);
    
                    if (frameId === 'TXXX') { // 自定義文本內容標籤
                        let textEncoding = bitReadery.read(1).toNum();
                        let descriptionSize = bitReadery.findTextEnd(textEncoding);
                        let description = bitReadery.read(descriptionSize).toStr(textEncoding);
                        let text = bitReadery.read(frameEndIndex - bitReadery.index).toStr(textEncoding);
                        frameData.description = description;
                        frameData.text = text;
                        console.log(`%c碼:${textEncoding} \n描述:${description} \n內容: ${text}`, style);
                    } else if (frameId[0] === 'T') { // 文本內容標籤
                        let textEncoding = bitReadery.read(1).toNum();
                        let text = bitReadery.read(frameSize - 1);
                        frameData.textEncoding = textEncoding;
                        frameData.text = text.toStr(textEncoding);
                        console.log(`%c編碼: ${textEncoding} \n源碼: ${text} \n文本: ${text.toStr(textEncoding)}`, style);
                    } else if (frameId === 'APIC') {  //  圖片內容標籤
                        let textEncoding = bitReadery.read(1).toNum();
                        frameData.textEncoding = textEncoding;
                        // MIME 类型 結尾標識為0
                        let mineType = bitReadery.read(bitReadery.findTextEnd(textEncoding)).toStr(textEncoding);
                        let picType = bitReadery.read(1).toNum();
                        // console.log(textEncoding);
                        // 圖片描述 結尾標識為0
                        let description  = bitReadery.read(bitReadery.findTextEnd(textEncoding)).toStr(textEncoding);;
                        let picSize = frameEndIndex - bitReadery.index;
                        let picData = bitReadery.read(picSize);
                        let url = window.URL.createObjectURL(new Blob([picData], {type: mineType}));
                        
                        frameData.description = description;
                        frameData.mineType = mineType;
                        frameData.picType = id3Map.picType[picType];
                        frameData.picData = picData;
                        frameData.size = picSize;
                        frameData.url = url;
                        console.log(`%c圖片類型: ${id3Map.picType[picType]} \n圖片格式:${mineType} \n圖片描述: ${description} \n圖片鏈接:${url}`, style);
                        // 轉base64
                        // let base64Pic = ``;
                        // picData.forEach(item => {
                        //     base64Pic += String.fromCharCode(item);
                        // });
                        // let pic = `data:${mineType};base64,${window.btoa(base64Pic)}`;
                    } else if (frameId === 'COMM') { // 注释
                        // 文本編碼
                        let textEncoding = bitReadery.read(1).toNum();
                        frameData.textEncoding = textEncoding;
                        // 語言
                        let language = bitReadery.read(3).toStr();
                        frameData.language = language;
                        // 描述結束長度, 標識0x00
                        let descripSize = bitReadery.findTextEnd(textEncoding);
                        // 描述
                        let descrip = bitReadery.read(descripSize).toStr(textEncoding);
                        frameData.descrip = descrip;
                        // 內容 網易雲 aes-128-ecb 解碼 #14ljk_!\]&0U<'(
                        let text = bitReadery.read(frameEndIndex - bitReadery.index).toStr(textEncoding);
                        
                        frameData.text = text;
                        console.log(`%c编码：${textEncoding} \n语言：${language} \n描述：${descrip} \n内容：${text}`, style);
                    } else if (frameId === 'UFID') {
                        let text = bitReadery.read(frameSize).toStr();
                        frameData.text = text
                        console.log(`%c文本: ${text}`, style);
                    } else {
                        console.log('%c其他數據未處理', style, bitReadery.read(frameSize));
                    }
                    this.audioInfo.frames.push(frameData);
                }
            } else if (ver === 2) {
                while (bitReadery.index < totalFrame) {
                    // 幀開始索引
                    let frameStartIndex = bitReadery.index;
                    let frameId = bitReadery.read(3).toStr();
                    // 找不到標籤
                    if (!id3Map.frameId[frameId]) {
                        console.log('非標籤', frameId)
                        break;
                    }
                    // 幀大小
                    let frameSize = bitReadery.read(3).toNum();
                    // 幀標識
                    // let frameFlag = bitReadery.read(2).toNum().toString(2).padStart(16, 0);
                    // 幀結束索引
                    let frameEndIndex = frameStartIndex + frameSize + 6; // 起始索引 + 幀大小 + 10字節幀頭
                    // 儲存幀數據
                    let frameData = {
                        frameId,
                        frameName: id3Map.frameId[frameId],
                        frameSize,
                        frameStartIndex,
                        frameEndIndex
                    };
                    
                    console.log(`%c索引: [${frameStartIndex}, ${frameEndIndex}) \n標籤: ${id3Map.frameId[frameId]} \n類型: ${frameId} \n長度: ${frameSize}\n`, style);
    
                    if (frameId === 'TXX') { // 自定義文本內容標籤
                        let textEncoding = bitReadery.read(1).toNum();
                        let descriptionSize = bitReadery.findTextEnd(textEncoding);
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
                        console.log(`%c編碼: ${textEncoding} \n源碼: ${text} \n文本: ${text.toStr(textEncoding)}`, style);
                    } else if (frameId === 'PIC') {  //  圖片內容標籤
                        let textEncoding = bitReadery.read(1).toNum();
                        frameData.textEncoding = textEncoding;
                        // MIME 类型 結尾標識為0
                        let mineTypeSize = bitReadery.findTextEnd(textEncoding);
                        let mineType = bitReadery.read(mineTypeSize, 1).toStr(textEncoding);
                        frameData.mineType = mineType;
                        let picType = bitReadery.read(1).toNum();
                        frameData.picType = picType;
                        // console.log(textEncoding);
                        // 圖片描述 結尾標識為0
                        let desSize = bitReadery.findTextEnd(textEncoding);
                        let description  = bitReadery.read(desSize, 1).toStr(textEncoding);;
                        frameData.description = description;
                        let picSize = frameEndIndex - bitReadery.index;
                        let picData = bitReadery.read(picSize);
                        frameData.picData = picData;
                        frameData.size = picSize;
                        let url = window.URL.createObjectURL(new Blob([picData], {type: mineType}));
                        frameData.url = url;
                        console.log(`%c圖片類型: ${id3Map.picType[picType]} \n圖片格式:${mineType} \n圖片描述: ${description}\n 圖片鏈接:${url}`);
                        // 轉base64
                        // let base64Pic = ``;
                        // picData.forEach(item => {
                        //     base64Pic += String.fromCharCode(item);
                        // });
                        // let pic = `data:${mineType};base64,${window.btoa(base64Pic)}`;
                    } else if (frameId === 'COM') { // 注释
                        // 文本編碼
                        let textEncoding = bitReadery.read(1).toNum();
                        // 語言
                        let language = bitReadery.read(3).toStr();
                        // let textSize = bitReadery.read(3).toNum();
                        frameData.textEncoding = textEncoding;
                        frameData.language = language;
                        // 描述結束長度, 標識0x00
                        let descripSize = bitReadery.findTextEnd(textEncoding);
                        // 描述
                        let descrip = bitReadery.read(descripSize, 1).toStr(textEncoding);
                        // 內容 網易雲 aes-128-ecb 解碼 #14ljk_!\]&0U<'(
                        let text = bitReadery.read(frameEndIndex - bitReadery.index).toStr(textEncoding);
                        frameData.descrip = descrip;
                        frameData.text = text;
                        console.log(`%c编码：${textEncoding} \n语言：${language} \n描述：${descrip} \n内容：${text}`, style);
                    } else if (frameId === 'UFID') {
                        let text = bitReadery.read(frameSize).toStr();
                        frameData.text = text
                        console.log(`%c文本:${text}`, style);
                    } else {
                        console.log('%cc其他數據未處理', style, bitReadery.read(frameSize));
                    }
                    this.audioInfo.frames.push(frameData);
                }
            }
        } else {
           console.log(`類型:${identifier}`);
        }
        console.log('ID3V2結束索引', this.audioInfo.frameSize);
        this.checkMp3Info(this.audioInfo.frameSize);
        this.checkID3V1();
        return this.audioInfo;
    }

    // 對src進行取值
    sliceInfo (src) {
        let index = 0;
        // console.log(src);
        return (size) => {
            let res = src.slice(index, index + size)
            index += size;
            return res;
        }
    }
    checkMp3Info (startIndex) {
        let bitReadery = new BitReader(this.uint8Array);
        bitReadery.skip(startIndex);
        let mp3Header = bitReadery.read(4);
        let sliceText = this.sliceInfo(Array.from(mp3Header , (n) => this.DEC2Other(n, 2, 8)).join(''));
        // 同步信息
        let syncInfo = sliceText(11);
        let infoFlag = bitReadery.findIndex([0x49, 0x6E, 0x66, 0x6F], {start: bitReadery.index, end: bitReadery.index + 32});
        console.log('有info标识', infoFlag);
        let lameFlag = bitReadery.findIndex([0x4C, 0x41, 0x4D, 0x45], {start: bitReadery.index, end: bitReadery.index + 32});
        console.log('有LAME标识', lameFlag);

        if (0 === bitReadery.read(24).toNum()) {
            console.log('MP3幀頭');
        }

        if (syncInfo !== ''.padStart(11, 1) && infoFlag -1 && lameFlag == -1) {
            console.log('存在髒數據, 結果不一定準確')
            let index = bitReadery.findIndex([0, 0xff, '*', '*', '*', 0]); // 
            let nexIndex = bitReadery.index + index + 1;
            this.checkMp3Info(nexIndex);
            return;
        }
        // 版本
        let version = sliceText(2);
        // 層
        let layer = sliceText(2);
        let vlMap = {'1111': 0, '1110': 1, '1101': 2, '0011': 3, '0010': 4, '0001': 5, '1011': 3, '1010': 4,'1001': 5 }
        // crc校驗
        let crcCheck = sliceText(1);
        // 位率
        let bitrateIndex = sliceText(4);
        let bitrate = Mp3Map.bitrate[bitrateIndex][vlMap[version + layer]];
        // 採樣率
        let samplingFrequencyIndex = sliceText(2);
        let samplingFrequency = Mp3Map.sampling[samplingFrequencyIndex][version]
        // 帧长调节
        let padding = sliceText(1);
        // 保留字
        let private1 = sliceText(1);
        // 聲道
        let mode = sliceText(2);
        // 扩充模式 当声道模式为01是才使用
        let extension = sliceText(2);
        // 版权
        let copyright = sliceText(1);
        // 原版标志
        let original = sliceText(1);
        // 强调模式
        let emphasis = sliceText(2);
        // 每帧采样数（帧时间戳）
        let bitSec = Mp3Map.bitSec[layer][version];
        let frameLeng =bitSec / 8 *bitrate / samplingFrequency * 1000;
        let totalFrame = (bitReadery.totalSize - this.audioInfo.frameSize  - 128) / frameLeng;
        console.log(
            ` 同步信息: ${syncInfo}\n`,
            `版本: ${Mp3Map.version[version]}\n`,
            `層: ${Mp3Map.layer[layer]}\n`,
            `crc校驗: ${Mp3Map.crcCheck[crcCheck]}\n`,
            `比特率: ${ bitrate }kbps\n`,
            `採樣率: ${ samplingFrequency }\n`,
            `帧长调节: ${Mp3Map.padding[padding]}\n`,
            `保留字: ${private1}\n`,
            `聲道: ${Mp3Map.mode[mode]}\n`,
            `扩充模式: ${ mode === '01' ?  Mp3Map.extension[extension] : '無' }\n`,
            `版权: ${Mp3Map.copyright[copyright]}\n`,
            `原版标志: ${Mp3Map.original[original]}\n`,
            `强调模式: ${Mp3Map.emphasis[emphasis]}\n`,
            `每帧采样数: ${Mp3Map.bitSec[layer][version]}\n`,
            `幀長度: ${frameLeng}\n`,
            `時長: ${ totalFrame * bitSec / samplingFrequency }`
        )
    }
    checkID3V1 () {
        let bitReadery = new BitReader(this.uint8Array);
        bitReadery.skip(this.uint8Array.length - 128);
        let flag = bitReadery.read(3).toStr();
        if (flag === 'TAG') {
            console.log('ID3V1');
            let songname = bitReadery.read(30).toStr();
            console.log(bitReadery.bitCache);
            let artist = bitReadery.read(30).toStr();
            let album　 = bitReadery.read(30).toStr();
            let year = bitReadery.read(4).toStr();
            let comment = bitReadery.read(28).toStr();
            let track = bitReadery.read();
            let genre  = bitReadery.read(1).toNum();
            if (track[0] !== 0) {
                comment += track.toStr();
            }
            console.log(
                ` 歌曲名: ${songname} \n`, 
                `藝術家: ${artist} \n`, 
                `專輯: ${album} \n`,
                `年份: ${year} \n`,
                `注釋: ${comment} \n`,
                `曲號: ${track}  \n流派: ${Id3Map[1].genre[genre] || ''}`);
        }
    }
}