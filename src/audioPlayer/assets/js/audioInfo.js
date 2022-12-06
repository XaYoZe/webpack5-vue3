// https://id3.org/id3v2.3.0
import Mp3Info from './mp3Info';
let Id3Info = require('./id3Info');
import FlacInfo from './flacInfo';
export default class AudioInfo {
    constructor(config) {
        let defaultConfig = {
            debug: true
        }
        Object.assign(defaultConfig, config)
        this.Id3Info = new Id3Info(defaultConfig);
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
        this.uint8Array = new Uint8Array(buffer);
        let info = null;
        let id3 = this.Id3Info.readyInfo(this.uint8Array);
        let mp3 = this.mp3Info.readyInfo(this.uint8Array, id3.v2.frameSize);
        let flac = this.flacInfo.readyInfo(this.uint8Array, id3.v2.frameSize);
        // info = this.flacInfo.readyInfo(this.uint8Array);
        return {id3, mp3};
    }
}