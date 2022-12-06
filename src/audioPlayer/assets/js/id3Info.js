// https://id3.org/id3v2.3.0
let BitReader = require('./utils');
let { Id3Map, Mp3Map } = require('./map');
class Id3Info {
    // uint8 數組
    uint8Array = null;
    // uint8 讀取索引
    bitReadery =  null;
    id3V1 = {};
    id3V2 = {
        header: {},
        frameSize: 0,
        frames: []
    };
    constructor({debug}) {
        this.debug = debug;
    }

    // 讀取buffer信息 16進制數組
    readyInfo(buffer) {
        this.uint8Array = buffer;
        this.id3V2 = {
            header: {},
            frameSize: 0,
            frames: []
        };
        this.bitReadery = new BitReader(this.uint8Array);
        this.checkID3V2();
        this.checkID3V1();
        return {v2: this.id3V2, v1: this.id3V1};
    }
    checkID3V2() {
        /*必须为"ID3"否则认为标签不存在*/
        let identifier = this.bitReadery.read(3).toStr();
        if (identifier === 'ID3') {
            /* 版本号ID3V2.3就记录3*/
            let ver = this.bitReadery.read(1).toNum();
            let id3Map = Id3Map[ver];
            /*副版本号此版本记录为0*/
            let revison = this.bitReadery.read(1).toNum();
            this.id3V2.version = `ID3V2.${ver}.${revison}`;
            this.debug && console.log(`版本: v2.${ver}.${revison}`);
            /*存放标志的字节，这个版本只定义了三位*/
            // abc00000 
            // a -- 表示是否使用不同步
            // b -- 表示是否有扩展头部
            // c -- 表示是否为测试标签
            let [unsynchronisation, extendedHeader, experimentalIndicator, footerPresent] = this.bitReadery.read(1).toBit();
            this.id3V2.header = {
                unsynchronisation: !!Number(unsynchronisation),
                extendedHeader: !!Number(extendedHeader),
                experimentalIndicator: !!Number(experimentalIndicator),
                footerPresent: !!Number(footerPresent)
            }
            /*标签大小，不包括标签头的10个字节的所有标签帧的大小*/
            // 二進制去最高位後拼接計算
            // 248708
            let totalFrame = Number('0b' + this.bitReadery.read(4).toBit(7)) + 10;
            this.id3V2.frameSize = totalFrame;
            this.debug && console.log(`使用不同步: ${!!Number(unsynchronisation)} \n扩展头部: ${!!Number(extendedHeader)} \n测试标签: ${!!Number(experimentalIndicator)}`, `\n幀尾內容: ${!!Number(footerPresent)}`);
            this.debug && console.log(`文件大小: ${this.bitReadery.totalSize} \n標籤信息大小: ${(totalFrame / 1024).toFixed(2)}kb`);
            // 有拓展標頭
            if (!!Number(extendedHeader)) {
                // 拓展標頭大小
                let ExtendedHeaderSize = this.bitReadery.read(4).toNum();
                // 
                let ExtendedHeaderFlag = this.bitReadery.read(2).toNum().toString(2).padStart(8)[0];
                let paddingSize = this.bitReadery.read(4).toNum();
                this.id3V2.header.extendedHeader = {
                    ExtendedHeaderSize,
                    ExtendedHeaderFlag,
                    paddingSize
                }
                this.debug && console.log(`拓展標頭大小: ${ExtendedHeaderSize}kb \n拓展標頭標識: ${ExtendedHeaderFlag}kb \n拓展標頭填充大小: ${paddingSize}`);
            }

            while (this.bitReadery.index < totalFrame) {
                let color = '#' + Array.from(Array(3), item => Math.ceil(Math.random() * 255).toString(16)).join('');
                let style = `color: ${color};font-size: 16px;`;
                let frameData = {};
                // 幀開始索引
                let frameStartIndex = this.bitReadery.index;
                if (ver === 4) {
                    let frameId = this.bitReadery.read(4).toStr();
                    // 找不到標籤
                    if (!id3Map.frameId[frameId]) {
                        this.debug && console.log('非標籤', frameId)
                        // this.debug && console.log(this.bitReadery.findIndex(255), this.bitReadery.read(500));
                        break;
                    }
                    // 幀大小
                    let frameSize = this.bitReadery.read(4).toNum();
                    // 幀標識
                    let frameFlag = this.bitReadery.read(2).toNum().toString(2).padStart(16, 0);
                    // 幀結束索引
                    let frameEndIndex = frameStartIndex + frameSize + 10; // 起始索引 + 幀大小 + 10字節幀頭
                    // 儲存幀數據
                    frameData = {
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

                    this.debug && console.log(`%c索引: [${frameStartIndex}, ${frameEndIndex}) \n標籤: ${id3Map.frameId[frameId]} \n類型: ${frameId} \n長度: ${frameSize} \n標識: ${frameFlag}\n`, style);

                    if (frameId === 'TXXX') { // 自定義文本內容標籤
                        let textEncoding = this.bitReadery.read(1).toNum();
                        this.debug && console.log(this.bitReadery.bitCache);
                        let descriptionSize = this.bitReadery.findTextEnd(textEncoding);
                        let description = this.bitReadery.read(descriptionSize).toStr(textEncoding);
                        this.debug && console.log(this.bitReadery.bitCache);
                        let text = this.bitReadery.read(frameEndIndex - this.bitReadery.index).toStr(textEncoding);
                        this.debug && console.log(this.bitReadery.bitCache);
                        frameData.description = description;
                        frameData.text = text;
                        this.debug && console.log(`%c編碼: ${textEncoding} \n描述: ${description} \n文本: ${text}`, style);
                    } else if (frameId[0] === 'T') { // 文本內容標籤
                        let textEncoding = this.bitReadery.read(1).toNum();
                        let text = this.bitReadery.read(frameSize - 1);
                        frameData.textEncoding = textEncoding;
                        frameData.text = text.toStr(textEncoding);
                        this.debug && console.log(`%c編碼: ${textEncoding} \n源碼: ${text} \n文本: ${text.toStr(textEncoding)}`, style);
                    } else if (frameId === 'APIC') {  //  圖片內容標籤
                        let textEncoding = this.bitReadery.read(1).toNum();
                        frameData.textEncoding = textEncoding;
                        // MIME 类型 結尾標識為0
                        let mineType = this.bitReadery.read(this.bitReadery.findTextEnd(0)).toStr();
                        let picType = this.bitReadery.read(1).toNum();
                        // this.debug && console.log(textEncoding);
                        // 圖片描述 結尾標識為0
                        let description = this.bitReadery.read(this.bitReadery.findTextEnd(textEncoding)).toStr(textEncoding);;
                        let picSize = frameEndIndex - this.bitReadery.index;
                        let picData = this.bitReadery.read(picSize);
                        let url = window.URL.createObjectURL(new Blob([picData], { type: mineType }));

                        frameData.description = description;
                        frameData.mineType = mineType;
                        frameData.picType = id3Map.picType[picType];
                        frameData.picData = picData;
                        frameData.size = picSize;
                        frameData.url = url;
                        this.debug && console.log(`%c圖片類型: ${id3Map.picType[picType]} \n圖片格式:${mineType} \n圖片描述: ${description} \n圖片鏈接:${url}`, style);
                        // 轉base64
                        // let base64Pic = ``;
                        // picData.forEach(item => {
                        //     base64Pic += String.fromCharCode(item);
                        // });
                        // let pic = `data:${mineType};base64,${window.btoa(base64Pic)}`;
                    } else if (frameId === 'COMM' || frameId === 'USLT') { // 注释
                        // 文本編碼
                        let textEncoding = this.bitReadery.read(1).toNum();
                        frameData.textEncoding = textEncoding;
                        // 語言
                        let language = this.bitReadery.read(3).toStr();
                        frameData.language = language;
                        // 描述結束長度, 標識0x00
                        let descripSize = this.bitReadery.findTextEnd(textEncoding);
                        // 描述
                        let descrip = this.bitReadery.read(descripSize, 1).toStr(textEncoding);
                        frameData.descrip = descrip;
                        // 內容 網易雲 aes-128-ecb 解碼 #14ljk_!\]&0U<'(
                        let text = this.bitReadery.read(frameEndIndex - this.bitReadery.index).toStr(textEncoding);

                        frameData.text = text;
                        this.debug && console.log(`%c编码：${textEncoding} \n语言：${language} \n描述：${descrip} \n内容：${text}`, style);
                    } else if (frameId === 'UFID') {
                        let text = this.bitReadery.read(frameSize).toStr();
                        frameData.text = text
                        this.debug && console.log(`%c文本:${text}`, style);
                    } else {
                        this.debug && console.log('其他數據未處理', this.bitReadery.read(frameSize));
                    }
                } else if (ver === 3) {
                    let frameId = this.bitReadery.read(4).toStr();
                    // 找不到標籤
                    if (!id3Map.frameId[frameId]) {
                        this.debug && console.log('非標籤', frameId)
                        break;
                    }
                    // 幀大小
                    let frameSize = this.bitReadery.read(4).toNum();
                    // 幀標識
                    let frameFlag = this.bitReadery.read(2).toNum().toString(2).padStart(16, 0);
                    // 幀結束索引
                    let frameEndIndex = frameStartIndex + frameSize + 10; // 起始索引 + 幀大小 + 10字節幀頭
                    // 儲存幀數據
                    frameData = {
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

                    this.debug && console.log(`%c索引: [${frameStartIndex}, ${frameEndIndex}) \n標籤: ${id3Map.frameId[frameId]} \n類型: ${frameId} \n長度: ${frameSize} \n標識: ${frameFlag}\n`, style);

                    if (frameId === 'TXXX') { // 自定義文本內容標籤
                        let textEncoding = this.bitReadery.read(1).toNum();
                        let descriptionSize = this.bitReadery.findTextEnd(textEncoding);
                        let description = this.bitReadery.read(descriptionSize).toStr(textEncoding);
                        let text = this.bitReadery.read(frameEndIndex - this.bitReadery.index).toStr(textEncoding);
                        frameData.description = description;
                        frameData.text = text;
                        this.debug && console.log(`%c碼:${textEncoding} \n描述:${description} \n內容: ${text}`, style);
                    } else if (frameId[0] === 'T') { // 文本內容標籤
                        let textEncoding = this.bitReadery.read(1).toNum();
                        let text = this.bitReadery.read(frameSize - 1);
                        frameData.textEncoding = textEncoding;
                        frameData.text = text.toStr(textEncoding);
                        this.debug && console.log(`%c編碼: ${textEncoding} \n源碼: ${text} \n文本: ${text.toStr(textEncoding)}`, style);
                    } else if (frameId === 'APIC') {  //  圖片內容標籤
                        let textEncoding = this.bitReadery.read(1).toNum();
                        frameData.textEncoding = textEncoding;
                        // MIME 类型 結尾標識為0
                        let mineType = this.bitReadery.read(this.bitReadery.findTextEnd(0)).toStr(0);
                        let picType = this.bitReadery.read(1).toNum();
                        // this.debug && console.log(textEncoding);
                        // 圖片描述 結尾標識根據編碼
                        let description = this.bitReadery.read(this.bitReadery.findTextEnd(textEncoding)).toStr(textEncoding);
                        console.log(this.bitReadery.bitCache);
                        let picSize = frameEndIndex - this.bitReadery.index;
                        let picData = this.bitReadery.read(picSize);
                        console.log(this.bitReadery.bitCache);
                        let url = window.URL.createObjectURL(new Blob([picData], { type: mineType }));

                        frameData.description = description;
                        frameData.mineType = mineType;
                        frameData.picType = id3Map.picType[picType];
                        frameData.picData = picData;
                        frameData.size = picSize;
                        frameData.url = url;
                        this.debug && console.log(`%c圖片類型: ${id3Map.picType[picType]} \n圖片格式:${mineType} \n圖片描述: ${description} \n圖片鏈接:${url}`, style);
                        // 轉base64
                        // let base64Pic = ``;
                        // picData.forEach(item => {
                        //     base64Pic += String.fromCharCode(item);
                        // });
                        // let pic = `data:${mineType};base64,${window.btoa(base64Pic)}`;
                    } else if (frameId === 'COMM' || frameId === 'USLT') { // 注释
                        // 文本編碼 1字节
                        let textEncoding = this.bitReadery.read(1).toNum();
                        frameData.textEncoding = textEncoding;
                        // 語言 3字节
                        let language = this.bitReadery.read(3).toStr();
                        frameData.language = language;
                        // 描述結束長度, 標識0x00
                        let descripSize = this.bitReadery.findTextEnd(textEncoding);
                        // 描述
                        let descrip = this.bitReadery.read(descripSize).toStr(textEncoding);
                        frameData.descrip = descrip;
                        // 內容 網易雲 aes-128-ecb 解碼 #14ljk_!\]&0U<'(
                        let text = this.bitReadery.read(frameEndIndex - this.bitReadery.index).toStr(textEncoding);

                        frameData.text = text;
                        this.debug && console.log(`%c编码：${textEncoding} \n语言：${language} \n描述：${descrip} \n内容：${text}`, style);
                    } else if (frameId === 'UFID') {
                        let text = this.bitReadery.read(frameSize).toStr();
                        frameData.text = text
                        this.debug && console.log(`%c文本: ${text}`, style);
                    } else {
                        this.debug && console.log('%c其他數據未處理', style, this.bitReadery.read(frameSize));
                    }
                } else if (ver === 2) {
                    let frameId = this.bitReadery.read(3).toStr();
                    // 找不到標籤
                    if (!id3Map.frameId[frameId]) {
                        this.debug && console.log('非標籤', frameId)
                        break;
                    }
                    // 幀大小
                    let frameSize = this.bitReadery.read(3).toNum();
                    // 幀標識
                    // let frameFlag = this.bitReadery.read(2).toNum().toString(2).padStart(16, 0);
                    // 幀結束索引
                    let frameEndIndex = frameStartIndex + frameSize + 6; // 起始索引 + 幀大小 + 10字節幀頭
                    // 儲存幀數據
                    frameData = {
                        frameId,
                        frameName: id3Map.frameId[frameId],
                        frameSize,
                        frameStartIndex,
                        frameEndIndex
                    };

                    this.debug && console.log(`%c索引: [${frameStartIndex}, ${frameEndIndex}) \n標籤: ${id3Map.frameId[frameId]} \n類型: ${frameId} \n長度: ${frameSize}\n`, style);

                    if (frameId === 'TXX') { // 自定義文本內容標籤
                        let textEncoding = this.bitReadery.read(1).toNum();
                        let descriptionSize = this.bitReadery.findTextEnd(textEncoding);
                        let description = this.bitReadery.read(descriptionSize, 1).toStr(textEncoding);
                        let text = this.bitReadery.read(frameEndIndex - this.bitReadery.index).toStr(textEncoding);
                        frameData.description = description;
                        frameData.text = text;
                        this.debug && console.log(` ${description}: ${text}`);
                    } else if (frameId[0] === 'T') { // 文本內容標籤
                        let textEncoding = this.bitReadery.read(1).toNum();
                        let text = this.bitReadery.read(frameSize - 1);
                        frameData.textEncoding = textEncoding;
                        frameData.text = text.toStr(textEncoding);
                        this.debug && console.log(`%c編碼: ${textEncoding} \n源碼: ${text} \n文本: ${text.toStr(textEncoding)}`, style);
                    } else if (frameId === 'PIC') {  //  圖片內容標籤
                        let textEncoding = this.bitReadery.read(1).toNum();
                        frameData.textEncoding = textEncoding;
                        // MIME 类型 結尾標識為0
                        let mineTypeSize = this.bitReadery.findTextEnd(textEncoding);
                        let mineType = this.bitReadery.read(mineTypeSize, 1).toStr(textEncoding);
                        frameData.mineType = mineType;
                        let picType = this.bitReadery.read(1).toNum();
                        frameData.picType = picType;
                        // this.debug && console.log(textEncoding);
                        // 圖片描述 結尾標識為0
                        let desSize = this.bitReadery.findTextEnd(textEncoding);
                        let description = this.bitReadery.read(desSize, 1).toStr(textEncoding);;
                        frameData.description = description;
                        let picSize = frameEndIndex - this.bitReadery.index;
                        let picData = this.bitReadery.read(picSize);
                        frameData.picData = picData;
                        frameData.size = picSize;
                        let url = window.URL.createObjectURL(new Blob([picData], { type: mineType }));
                        frameData.url = url;
                        this.debug && console.log(`%c圖片類型: ${id3Map.picType[picType]} \n圖片格式:${mineType} \n圖片描述: ${description}\n 圖片鏈接:${url}`);
                        // 轉base64
                        // let base64Pic = ``;
                        // picData.forEach(item => {
                        //     base64Pic += String.fromCharCode(item);
                        // });
                        // let pic = `data:${mineType};base64,${window.btoa(base64Pic)}`;
                    } else if (frameId === 'COM' || frameId === 'SLT') { // 注释 歌词
                        // 文本編碼
                        let textEncoding = this.bitReadery.read(1).toNum();
                        // 語言
                        let language = this.bitReadery.read(3).toStr();
                        // let textSize = this.bitReadery.read(3).toNum();
                        frameData.textEncoding = textEncoding;
                        frameData.language = language;
                        // 描述結束長度, 標識0x00
                        let descripSize = this.bitReadery.findTextEnd(textEncoding);
                        // 描述
                        let descrip = this.bitReadery.read(descripSize, 1).toStr(textEncoding);
                        // 內容 網易雲 aes-128-ecb 解碼 #14ljk_!\]&0U<'(
                        let text = this.bitReadery.read(frameEndIndex - this.bitReadery.index).toStr(textEncoding);
                        frameData.descrip = descrip;
                        frameData.text = text;
                        this.debug && console.log(`%c编码：${textEncoding} \n语言：${language} \n描述：${descrip} \n内容：${text}`, style);
                    } else if (frameId === 'UFID') {
                        let text = this.bitReadery.read(frameSize).toStr();
                        frameData.text = text
                        this.debug && console.log(`%c文本:${text}`, style);
                    } else {
                        this.debug && console.log('%cc其他數據未處理', style, this.bitReadery.read(frameSize));
                    }
                }
                this.id3V2.frames.push(frameData);
            }
        } else {
            this.debug && console.log(`類型:${identifier}`);
        }
        this.debug && console.log('ID3V2結束索引', this.id3V2.frameSize);
        return this.id3V2;
    }
    // 查找id3v1信息
    checkID3V1() {
        this.bitReadery.skip(this.uint8Array.length - 128);
        let flag = this.bitReadery.read(3).toStr();
        if (flag === 'TAG') {
            let title = this.bitReadery.read(30).toStr();
            let artist = this.bitReadery.read(30).toStr();
            let album = this.bitReadery.read(30).toStr();
            let year = this.bitReadery.read(4).toStr();
            let comment = this.bitReadery.read(28).toStr();
            let track = this.bitReadery.read();
            let genre = this.bitReadery.read(1).toNum();
            if (track[0] !== 0) {
                comment += track.toStr();
            }
            this.id3V1 = {
                title,
                artist,
                album,
                year,
                comment,
                track,
                genre: Id3Map[1].genre[genre] || ''
            }
            this.debug && console.log(`ID3V1 \n歌曲名: ${title} \n藝術家: ${artist} \n專輯: ${album} \n年份: ${year} \n注釋: ${comment} \n曲號: ${track}  \n流派: ${Id3Map[1].genre[genre] || ''}`);
        }
    }
}
module.exports = Id3Info;