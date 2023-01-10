// https://id3.org/id3v2.3.0
import BitReader from './utils';
import { flacMap } from './map';
export default class FlacInfo {
    // uint8 數組
    uint8Array = null;
    // uint8 讀取索引
    sliceIndex = 0;

    constructor(debug) {
        this.debug = debug;
        window.arrToNum = this.arrToNum;
        window.arrToStr = this.arrToStr;
    }
    // 讀取buffer信息 16進制數組
    readyInfo (buffer, startIndex = 0) {
        this.uint8Array = buffer;
        this.sliceIndex = 0;
        return this.checkInfo(startIndex);
    }
    checkInfo (startIndex) {
        let bitReadery = new BitReader(this.uint8Array);
        bitReadery.skip(startIndex);
        let identifier = bitReadery.read(4).toStr();
        if (identifier === 'fLaC') {
            let info = {
                version: identifier
            }
            let isLast = false;
            let length = 0;
            while (!isLast) {
                let headerInfo = bitReadery.read(1).toNum();
                let headerSize = bitReadery.read(3).toNum();
                let metaData = null;
                if (headerInfo >= 0b10000000) {
                    isLast = true;
                    headerInfo-= 0b10000000;
                }
                switch (headerInfo) {
                    // 流信息
                    case 0:
                        let blockMinSize = bitReadery.read(2).toNum(); // 最小塊 0-15 无效。
                        let blockMaxSize = bitReadery.read(2).toNum(); // 最大塊
                        let frameMinSize = bitReadery.read(3).toNum(); // 最小幀
                        let frameMaxSize = bitReadery.read(3).toNum(); // 最大幀
                        let readBit = BitReader.Slice(bitReadery.read(8).toBit());
                        let sampleRate = Number(`0b${readBit(20)}`); // 采样率
                        let channels = Number(`0b${readBit(3)}`) + 1; // 通道數 - 1
                        let sampleBits = Number(`0b${readBit(5)}`)  + 1;// 採樣大小 - 1
                        let totalSamples = Number(`0b${readBit(36)}`);// 總採樣數
                        length = Math.floor(totalSamples / sampleRate);
                        let sampleBit = length * sampleRate;
                        let md5 = BitReader.DecTranslate(bitReadery.read(16), 16, 2);
                        console.log(`最小塊:${blockMinSize}\n最大塊:${blockMaxSize}\n最小幀:${frameMinSize}\n最大幀:${frameMaxSize}\n采样率: ${ sampleRate / 1000}kHz\n通道數: ${channels}\n採樣大小:${sampleBits}位\n總樣本:${totalSamples}\n時長: ${length}s\n比特率${sampleBit}\nmd5:${md5}`);
                        break;
                    // 圖片
                    case 6:
                        let picType = bitReadery.read(4).toNum(); // 圖片類型
                        let mimeSize = bitReadery.read(4).toNum(); // mine類型長度
                        let mineType = bitReadery.read(mimeSize).toStr(); // mine類型
                        let desSize = bitReadery.read(4).toNum(); // 描述長度
                        let des = bitReadery.read(desSize).toStr(1); // 描述
                        let width = bitReadery.read(4).toNum(); // 圖片寬度
                        let height = bitReadery.read(4).toNum(); // 圖片高度
                        let depth  = bitReadery.read(4).toNum(); // 顏色深度
                        let indexed  = bitReadery.read(4).toNum(); // 顏色縮影
                        let picSize = bitReadery.read(4).toNum(); // 圖片大小
                        let picData = bitReadery.read(picSize); // 圖片數據
                        let url = window.URL.createObjectURL(new Blob([picData], { type: mineType }));
                        let base64 = `data:${mineType};base64,${picData.toBase64()}`;
                        console.log(`圖片\n圖片類型: ${flacMap.picType[picType]}\n圖片格式: ${mineType}\n圖片大小:${parseInt(picData.length / 1024)}kb\n圖片描述: ${des}\n圖片寬度: ${width}\n圖片高度: ${height}\n顏色深度: ${depth}\n顏色索引: ${indexed}\n本地鏈接:${url}\n%c `, `padding:100px 100px;background:url(${base64}) no-repeat center/cover;`);
                        // console.log(``, , picData);
                        break;
                    case 4: // 注釋
                      let endIndex = bitReadery.index + headerSize;
                      let vendorLength = bitReadery.read(4).reverse().toNum(); // 供應商長度
                      let vendorString = bitReadery.read(vendorLength).toStr(3); // 供應商
                      let userCommentListLength = bitReadery.read(4).reverse().toNum(); // 注釋個數
                      console.log( `供應商:${vendorString}\n`); 
                      for (let i = 0; i < userCommentListLength;i ++) {
                        let length = bitReadery.read(4).reverse().toNum(); // 注釋長度
                        let comment  = bitReadery.read(length).toStr(3).split('='); // 注釋
                        let key = comment[0]; // 注釋名
                        let val = comment[1]; // 注釋內容
                        console.log( `字段: ${flacMap.comment[key] || key }\n值: ${val}\n長度:${length}`);
                      }
                      console.log(`注釋結束索引: ${ endIndex }\n實際結束索引:${ bitReadery.index }`);
                      break   
                    case 5:
                        metaData = bitReadery.read(headerSize);
                        console.log('CUESHEET', metaData);
                        break
                    case 3:
                        for (let i = 0; i < headerSize / 18; i++) {
                          let sample  = bitReadery.read(8).toNum();
                          let offset  = bitReadery.read(8).toNum();
                          let sampleNum = bitReadery.read(2).toNum();
                          console.log(sample, offset, sampleNum);
                          // console.log('SEEKTABLE', headerSize / 18, metaData);
                        }
                        console.log('尋道點數量', headerSize / 18, bitReadery.index);
                        break
                    case 2:
                        metaData = bitReadery.read(headerSize);
                        console.log('APPLICATION', metaData);
                        break
                    case 1:
                        console.log('PADDING', headerInfo);
                        bitReadery.skip(headerSize)
                        break;
                    default:
                        metaData = bitReadery.read(headerSize);
                        // console.log('其他', headerInfo, metaData);
                    break;
                }
                // console.log(headerInfo, headerSize, metaData);
            }
            if (isLast) {

              let totalFrameSize = bitReadery.buffer.length -  bitReadery.index;
              let bits = Math.round(totalFrameSize * 8 / (length * 1000));
              console.log(`頭部大小: ${bitReadery.index / 1024}K\n內容大小:${ totalFrameSize / 1024**2 }M\n比特率:${bits}kbps`);
            }
            return info;
        }
        return
        // console.log();
    }
}