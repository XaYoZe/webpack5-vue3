
import { checkFontFileType, string2UCode } from './utils'
import fonteditorCore, { Font, woff2 } from "fonteditor-core";

/**
 * 字體包提取指定文字
 * 
 */
class fontMin {
  initWoff2 = false;
  file = { 
    buffer: null,
    ser: null,
    loaded: false
  };
  font = {}
  unicodeRange = {
    // ascii: [0x21, 0xff],
    ascii: {
      num: [0x30, 0x39],
      uppercase: [0x41, 0x5a],
      lowercase: [0x61, 0x7a],
      punctuation: [[0x20, 0x2f], [0x3a , 0x40], [0x5b, 0x60], [0x5b, 0x60], [0x7b, 0x7e]]
    }
  }
  constructor () {}
  /**
   * 生成範圍內數值
   * @param {array} arr [開始, 結束] 或 [[開始, 結束], [開始, 結束]]
   * @returns { array } 數值列表
   */
  createRange (arr) {
    let rangeList = [];
    if (!arr) return [];
    if (Array.isArray(arr[0])) {
      arr.forEach(item => {
        let length = item[1] - item[0];
        for (let i = 0; i <= length; i++) {
          rangeList.push(i+item[0])
        }
      })
    } else {
      let length = arr[1] - arr[0];
      for (let i = 0; i <= length; i++) {
        rangeList.push(i+arr[0])
      }
    }
    return rangeList
  }
  async minifly (text = [], options = {}) {

    if (!this.file.loaded) {
      await this.loadFile()
    }
    if (this.file.info) {
      if (this.file.info.ext === 'woff2' && !this.initWoff2) {
        await woff2.init(require('fonteditor-core/woff2/woff2.wasm'));
        this.initWoff2 = true;
      }
      let subset = string2UCode(text)
      if (options.range) {
        options.range.forEach(item => {
          subset = subset.concat(this.createRange(this.unicodeRange.ascii[item]));
        })
      }
      let font = new Font(this.file.buffer, {
        type: this.file.info.ext,
        hinting: true,
        subset
      })
      let a = {}
      font.optimize(a);
      this.font = {
        font,
        info: font.get(),
        text: text
      }
      return font
    }
  }
  src (file) {
    if (this.file.loaded && (this.file.buffer === file || this.file.src === file)) {
      return this
    }
    this.file.loaded = false;
    if (file.constructor === ArrayBuffer) {
      this.file.buffer = file;
    } else if (typeof file === 'string') {
      this.file.src = file;
    } else {
      console.log('文件格式不對, 需要String或者arrayBuffer')
      return this
    }
    return this
  }
  async loadFile () {
    let buffer = this.file.buffer;
    if (this.file.src) {
      try {
        buffer = await fetch(file).then(res=> res.arrayBuffer());
      } catch (err) {
        console.log('加載文件錯誤', err);
        return
      }
    }
    let u8a = new Uint8Array(buffer);
    this.file = Object.assign(this.file, {
      loaded: true,
      uint8Array: u8a,
      buffer: buffer,
      info: checkFontFileType(u8a)
    })
    return this.file
  }
  download (type) {
    if (this.font.font) {
      let a = document.createElement('a');
      a.download = `${this.font.info.name.fontFamily}.${ type || this.file.info.ext}`;
      a.href = this.font.font.toBase64({type: type || this.file.info.ext});
      a.click();
    }
  }
}
export default fontMin;