// https://id3.org/id3v2.3.0
import BitReader from './utils';
import { Id3Map } from './map';
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
            let blockMinSize = bitReadery.read(2).toNum();
            let blockMaxSize = bitReadery.read(2).toNum();
            let frameMinSize = bitReadery.read(3).toNum();
            let frameMaxSize = bitReadery.read(3).toNum();
            console.log(`最小塊大小:${blockMinSize}
            最大塊大小:${blockMaxSize}
            最小幀大小:${frameMinSize}
            最大幀大小:${frameMaxSize}
            `);
            return info;
        }
        return
        // console.log();
    }
}