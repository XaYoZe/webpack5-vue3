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
    readyInfo (buffer) {
        this.uint8Array = buffer;
        this.sliceIndex = 0;
        return this.checkInfo(this.uint8Array);
    }
    checkInfo () {
        let bitReadery = new BitReader(this.uint8Array);
        let identifier = bitReadery.read(4).toStr();
        if (identifier === 'fLaC') {
            let info = {
                version: identifier
            }
            console.log('類型:', identifier);
            return info;
        }
        // console.log();
    }
}