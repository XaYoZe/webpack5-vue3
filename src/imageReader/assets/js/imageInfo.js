// https://id3.org/id3v2.3.0
import PngInfo from './pngInfo';
export default class ImageInfo {
    constructor(config) {
        let defaultConfig = {
            debug: true
        }
        Object.assign(defaultConfig, config)
        this.pngInfo = new PngInfo(defaultConfig);
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
        info = this.pngInfo.readyInfo(this.uint8Array);
        return {id3: {}, mp3: {}};
    }
}