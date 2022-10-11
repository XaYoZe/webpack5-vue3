// https://id3.org/id3v2.3.0
import Mp3Info from './mp3Info';
import FlacInfo from './flacInfo';
export default class AudioInfo {
    constructor(config) {
        let defaultConfig = {
            debug: false
        }
        Object.assign(defaultConfig, config)
        this.mp3Info = new Mp3Info(defaultConfig);
        this.flacInfo = new FlacInfo(defaultConfig);
    }
    readyInfoFromUrl (url) {
        return new Promise((reslove, reject) => {
            fetch(url).then(res => res.arrayBuffer()).then(res => {
                reslove(this.readyInfo(res));
            })
        })
    }
    // 讀取buffer信息
    readyInfo (buffer) {
        let info = {};
        console.log(buffer)
        this.uint8Array = new Uint8Array(buffer);
        info = this.flacInfo.readyInfo(this.uint8Array);
        info = info || this.mp3Info.readyInfo(this.uint8Array);
        return info;
    }
}