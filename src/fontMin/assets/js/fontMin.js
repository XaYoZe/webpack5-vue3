
/* eslint-env node */

// var fonteditor = require('fonteditor-core/src/main');
// var combine = require('stream-combiner');
// var fileType = imp('./utils')
import { checkFontFileType, string2UCode } from './utils'
import { Font, woff2 } from "fonteditor-core";

// let fileType = require('file-type')
// var concat = require('concat-stream');
// var EventEmitter = require('events').EventEmitter;
// var inherits = require('util').inherits;
// var bufferToVinyl = require('buffer-to-vinyl');
// var vfs = require('vinyl-fs');

/**
 * Initialize fontExtract
 *
 * @constructor
 * @api public
 */
class fontMin {
  file = null;
  fileBuffer = null;
  constructor () {

  }
  src (file) {
    this.file = null;
    this.fileBuffer = null;
    if (file.constructor === ArrayBuffer) {
      this.fileBuffer = file
    } else if (typeof file === 'string') {
      this.file = file;
    } else {
      console.log('文件格式不對, 需要String或者arrayBuffer')
    }
    return this
  }
  async getFile () {
    if (!this.fileBuffer) {
      this.fileBuffer = await fetch(this.file).then(res=> res.arrayBuffer());
    }
    console.log(this.fileBuffer)
    return this.fileBuffer
  }
  async min (text) {
    let fontBuffer = await this.getFile();
    let u8a = new Uint8Array(fontBuffer);
    let fontType = checkFontFileType(u8a);
    console.log(text)
    console.log(fontType)
    if (fontType) {
      let subset =  string2UCode(text);
      console.log(subset);
      if (fontType.ext === 'woff2') {
        // console.log(require());
        await woff2.init(require('fonteditor-core/woff2/woff2.wasm'));
      }
      let font = Font.create(fontBuffer, {
        type: fontType.ext,
        subset: []
      })
      console.log(font);
    }
    // let min = glyph({ 
    //   text,
    //   hinting: false         // keep ttf hint info (fpgm, prep, cvt). default = true
    // }, fontBuffer)
    // return min
  }
}
/**
 * Module exports
 */
// module.exports = FonMin;
export default fontMin;