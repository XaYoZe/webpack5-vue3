// https://www.crifan.com/files/doc/docbook/mpeg_vbr/release/htmls/index.html
const BitReader = require('./utils');

function crc32(data) {
  const crcTable = [];
  const polynomial = 0xedb88320;

  // Generate CRC table
  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ polynomial;
      } else {
        crc = crc >>> 1;
      }
    }
    crcTable[i] = crc;
  }

  let crc = 0xffffffff;
  for (let byte of data) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  
  return crc ^ 0xffffffff;
}

class PngInfo {
    // uint8 數組
    uint8Array = null;
    // uint8 讀取索引
    mp3 = {
        header: {},
        frameSize: 0,
        frames: []
    };
    constructor({debug}) {
        this.debug = debug;
    }

    // 讀取buffer信息 16進制數組
    readyInfo(buffer, startIndex) {
        this.uint8Array = buffer;
        this.mp3 = {
            header: {},
            frameSize: 0,
            frames: []
        };
        return this.checkPng(startIndex);
    }
  
    // 查找mp3幀信息
    checkPng(startIndex = 0) {
        let mp3Info = {};
        let bitReadery = new BitReader(this.uint8Array);
        bitReadery.skip(startIndex);
        let pngFlagIndex = bitReadery.findIndex([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], { start: 0, end: 0 });
        if (pngFlagIndex !== 0) {
            return;
        }
        bitReadery.skip(8)

        let length = 0;
        let chunkType = 0;
        let chunkData = 0;
        let chunkCrc = 0;
        const getChunk = () => {
          length = bitReadery.read(4).toNum();
          chunkType = bitReadery.read(4).toStr();
          chunkData = bitReadery.read(length);
          chunkCrc = bitReadery.read(4)
          if (chunkType === 'IHDR') {
            let sliceData = BitReader.Slice(chunkData);
            let width = sliceData(4).toNum();
            let height = sliceData(4).toNum();
            let bitDepth = sliceData(1).toNum();
            let colorType = sliceData(1).toNum();
            let compression = sliceData(1).toNum();
            let filter = sliceData(1).toNum();
            let interlace = sliceData(1).toNum();
            console.log(
              ` 宽度：${width}\n`,
              `高度：${height}\n`,
              `位深：${bitDepth}\n`,
              `颜色类型：${colorType}\n`,
              `压缩格式：${compression}\n`,
              `过滤方式：${filter}\n`,
              `扫描方式：${interlace}\n`,
              `数据长度：${length}`
            )
          } else
          if (chunkType === 'pHYs') {
            let sliceData = BitReader.Slice(chunkData);
            let x = sliceData(4).toNum();
            let y = sliceData(4).toNum();
            let unit = sliceData(1).toNum();
            console.log(crc32(chunkData), chunkCrc.toNum())
            if (unit === 1) {
              console.log(` x dpi：${x / 39.3700787}\n`, `y dpi：${y / 39.3700787}\n`, `unit：${unit}\n`, `数据长度：${length}`)
            } else {
              console.log(` x：${x}\n`, `y：${y}\n`, `unit：${unit}\n`, `数据长度：${length}`)
            }
          } else
          if (chunkType === 'IDAT') {
            let sliceData = BitReader.Slice(chunkData);

            console.log(`数据长度：${length}`)
          } else 
          if (chunkType === 'acTL') {
            let sliceData = BitReader.Slice(chunkData);
            let numFrames = sliceData(4).toNum();
            let numPlays = sliceData(4).toNum();
            console.log(`numFrames：${numFrames}\n`, `numPlays：${numPlays}\n`, `数据长度：${length}`)
            // console.log(chunkType, length, chunkData);
          } else if (chunkType === 'fdAT') {
            let sliceData = BitReader.Slice(chunkData);
            let sequenceNumber = sliceData(4).toNum();
            let width = sliceData(4);
            let height = sliceData(4).toNum();
            let xOffset = sliceData(4).toNum();
            let yOffset = sliceData(4).toNum();
            let delayNumber = sliceData(2).toNum();
            let delaydenominator = sliceData(2).toNum();
            let disposeOperation = sliceData(1).toNum();
            let blendOperation = sliceData(1).toNum();
            console.log(`序列号：${sequenceNumber}\n`, `宽度：${width}\n`, Number('0b' + width.toBit()))
            // console.log(chunkType, length, chunkData);
          }
          // if (chunkType === 'iTXt' || chunkType === 'tEXt' || chunkType === 'zTXt') {
          //   console.log(length, chunkType, chunkData.toStr(), crc);
          // }
          // console.log(chunkType, length);
        }
        while (chunkType !== 'IEND') {
          getChunk();
        }
        // let mp3Header = bitReadery.read(8).toStr();
        // let sliceText = BitReader.Slice(mp3Header);
        // console.log(startIndex, mp3Header)
        // 同步信息
        // let syncInfo = sliceText(11);
        // bitReadery.skip(32);
        // let infoFlag = bitReadery.findIndex([0x49, 0x6E, 0x66, 0x6F], { start: bitReadery.index, end: bitReadery.index + 32 });
        // let lameFlag = bitReadery.findIndex([0x4C, 0x41, 0x4D, 0x45], { start: bitReadery.index, end: bitReadery.index + 32 });
        // let xingFlag = bitReadery.findIndex([0x58, 0x69, 0x6E, 0x67], { start: bitReadery.index, end: bitReadery.index + 32 });
        // this.debug && console.log(`info标识: ${infoFlag};\nLAME标识: ${lameFlag};\nxing标识: ${xingFlag}`);

        // if (0 === bitReadery.read(24).toNum()) {
        //     this.debug && console.log('MP3幀頭');
        // }

        // if (syncInfo !== ''.padStart(11, 1) && infoFlag == - 1 && lameFlag == -1 && xingFlag == -1 ) {
        //     this.debug && console.log('有髒數據, 結果不一定準確');
        //     let index = bitReadery.findIndex([0, 0xff, `>${0xe0}`, '*', '*', 0]); // 
        //     let nexIndex = bitReadery.index + index + 1;
        //     this.checkPng(nexIndex);
        //     return;
        // }
        // // 版本
        // let version = sliceText(2);
        // // 層
        // let layer = sliceText(2);
        // if (layer == '00') return;
        // let vlMap = { '1111': 0, '1110': 1, '1101': 2, '0011': 3, '0010': 4, '0001': 5, '1011': 3, '1010': 4, '1001': 5 }
        // // crc校驗
        // let crcCheck = sliceText(1);
        // // 位率
        // let bitrateIndex = sliceText(4);
        // let bitrate = Mp3Map.bitrate[bitrateIndex][vlMap[version + layer]];
        // // 採樣率
        // let samplingFrequencyIndex = sliceText(2);
        // let samplingFrequency = Mp3Map.sampling[samplingFrequencyIndex][version]
        // // 帧长调节
        // let padding = sliceText(1);
        // // 保留字
        // let private1 = sliceText(1);
        // // 聲道
        // let mode = sliceText(2);
        // // 扩充模式 当声道模式为01是才使用
        // let extension = sliceText(2);
        // // 版权
        // let copyright = sliceText(1);
        // // 原版标志
        // let original = sliceText(1);
        // // 强调模式
        // let emphasis = sliceText(2);
        // // 每帧采样数（帧时间戳）
        // let bitSec = Mp3Map.bitSec[layer][version];
        // let frameSize = (bitSec / 8 * bitrate  * 1000 / samplingFrequency) + Number(padding);
        // let totalFrame = (bitReadery.totalSize - startIndex - 128) / frameSize;
        // this.debug && console.log(
        //     `同步信息: ${syncInfo}\n版本: ${Mp3Map.version[version]}\n層: ${Mp3Map.layer[layer]}\ncrc校驗: ${Mp3Map.crcCheck[crcCheck]}\n比特率: ${bitrate}kbps\n採樣率: ${samplingFrequency}\n帧长调节: ${Mp3Map.padding[padding]}\n保留字: ${private1}\n聲道: ${Mp3Map.mode[mode]}\n扩充模式: ${mode === '01' ? Mp3Map.extension[extension] : '無'}\n版权: ${Mp3Map.copyright[copyright]}\n原版标志: ${Mp3Map.original[original]}\n强调模式: ${Mp3Map.emphasis[emphasis]}\n每帧采样数: ${Mp3Map.bitSec[layer][version]}\n幀長度: ${frameSize}\n時長: ${totalFrame * bitSec / samplingFrequency}`
        // );
        
        // mp3Info = {
        //     field: {
        //         syncInfo: '同步信息',
        //         version: '版本',
        //         layer: '層',
        //         crcCheck: 'crc校驗',
        //         bitrate: '比特率',
        //         samplingFrequency: '採樣率',
        //         padding: '帧长调节',
        //         private1: '聲道',
        //         mode: '聲道',
        //         modeType: '扩充模式',
        //         copyright: '版权',
        //         original: '原版标志',
        //         emphasis: '强调模式',
        //         frameSize: '每帧采样数',
        //         frameSize: '幀長度',
        //         time: '時長',
        //     },
        //     syncInfo,
        //     version: Mp3Map.version[version],
        //     layer: Mp3Map.layer[layer],
        //     crcCheck: Mp3Map.crcCheck[crcCheck],
        //     bitrate,
        //     samplingFrequency,
        //     padding: Mp3Map.padding[padding],
        //     private1,
        //     mode: Mp3Map.mode[mode], 
        //     modeType: mode === '01' ? Mp3Map.extension[extension] : '無',
        //     copyright: Mp3Map.copyright[copyright],
        //     original: Mp3Map.original[original],
        //     emphasis: Mp3Map.emphasis[emphasis],
        //     frameSize: Mp3Map.bitSec[layer][version],
        //     frameSize,
        //     time: totalFrame * bitSec / samplingFrequency,
        // }
        return mp3Info
    }
}

module.exports = PngInfo;