/**
 * @file glyph
 * @author junmer
 */

/* eslint-env node */
var _ = require("lodash");
var isTtf = require("is-ttf/index");
// var through = require('through2');
var { TTF, TTFReader, TTFWriter } = require("fonteditor-core").default;
// var TTFReader = require('fonteditor-core').default.TTFReader;
// var TTFWriter = require('fonteditor-core').TTFWriter;
// var b2ab = require('b3b').b2ab;
// var ab2b = require('b3b').ab2b;
var util = require("../lib/util");

/**
 * convert arrayBuffer to buffer
 *
 * @alias arrayBufferToBuffer
 * @param  {ArrayBuffer} ab arrayBuffer
 * @return {buffer}             buffer
 */
function ab2b(ab) {
  var buffer = new ArrayBuffer(ab.byteLength);
  var view = new Uint8Array(ab);

  for (var i = 0, l = buffer.length; i < l; i++) {
    buffer[i] = view[i];
  }

  return buffer;
}

/**
 * convert buffer to arrayBuffer
 *
 * @alias bufferToArrayBuffer
 * @param  {buffer} buffer buffer
 * @return {ArrayBuffer}             arrayBuffer
 */
function b2ab(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);

  for (var i = 0, l = buffer.length; i < l; ++i) {
    view[i] = buffer[i];
  }

  return ab;
}

/**
 * getSubsetGlyfs
 *
 * @param  {ttfObject} ttf ttfobj
 * @param  {Array} subset subset unicode
 * @return {Array}     glyfs array
 */
function getSubsetGlyfs(ttf, subset) {
  var glyphs = [];

  var indexList = ttf.findGlyf({
    unicode: subset || [],
  });

  if (indexList.length) {
    glyphs = ttf.getGlyf(indexList);
  }

  glyphs.unshift(ttf.get().glyf[0]);

  return glyphs;
}

/**
 * minifyFontObject
 *
 * @param  {Object} ttfObject    ttfObject
 * @param  {Array} subset         subset
 * @param  {Function=} plugin       use plugin
 * @return {Object}              ttfObject
 */
function minifyFontObject(ttfObject, subset, plugin) {
  // check null
  if (subset.length === 0) {
    return ttfObject;
  }

  // new TTF Object
  var ttf = new TTF(ttfObject);

  // get target glyfs then set
  ttf.setGlyf(getSubsetGlyfs(ttf, subset));

  // use plugin
  if (_.isFunction(plugin)) {
    plugin(ttf);
  }

  return ttf.get();
}

/**
 * minifyTtf
 *
 * @param  {Buffer|Object} contents         contents
 * @param  {Object} opts         opts
 * @return {Buffer}              buffer
 */
function minifyTtf(buffer, opts) {
  opts = opts || {};

  var ttfobj = buffer;

  if (buffer.constructor === ArrayBuffer) {
    ttfobj = new TTFReader(opts).read(buffer);
  }
  var miniObj = minifyFontObject(ttfobj, opts.subset, opts.use);
  // console.log(new TTFWriter(opts).write(miniObj))
  var ttfBuffer = new TTFWriter(opts).write(miniObj);
  return {
    object: miniObj,
    buffer: ttfBuffer,
  };
}

/**
 * glyph fontmin plugin
 *
 * @param {Object} opts opts
 * @param {string=} opts.text text
 * @param {boolean=} opts.basicText useBasicText
 * @param {boolean=} opts.hinting hint
 * @param {Function=} opts.use plugin
 * @param {Function=} opts.use arrayBuffer
 * @return {Object} stream.Transform instance
 * @api public
 */
module.exports = function (opts, buffer) {
  let u8a = new Uint8Array(buffer);
  opts = _.extend({ hinting: true, trim: false }, opts);
  // prepare subset
  var subsetText = util.getSubsetText(opts);
  opts.subset = util.string2unicodes(subsetText);
  // check ttf
  if (!isTtf(u8a)) {
    console.log("!isTff");
    return;
  }

  try {
    var miniTtf = minifyTtf(buffer, opts);

    contents = miniTtf.buffer;
    ttfObject = miniTtf.object;
    console.log(contents, ttfObject);
    return miniTtf
  } catch (err) {
    console.log(err);
  }

  // });
};
