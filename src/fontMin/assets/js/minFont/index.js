/**
 * @file fontmin
 * @author junmer
 */

/* eslint-env node */

// var fonteditor = require('fonteditor-core/src/main');
// var combine = require('stream-combiner');
// var concat = require('concat-stream');
// var EventEmitter = require('events').EventEmitter;
// var inherits = require('util').inherits;
// var bufferToVinyl = require('buffer-to-vinyl');
// var vfs = require('vinyl-fs');

/**
 * Initialize Fontmin
 *
 * @constructor
 * @api public
 */
function Fontmin() {
    if (!(this instanceof Fontmin)) {
        return new Fontmin();
    }
    // EventEmitter.call(this);
    this.streams = [];
}

/**
 * Inherit from `EventEmitter`
 * @type {Class}
 */
// inherits(Fontmin, EventEmitter);

/**
 * Get or set the source files
 *
 * @param {Array|Buffer|string} file files to be optimized
 * @return {Object} fontmin
 * @api public
 */
Fontmin.prototype.src = function (file) {
    if (!arguments.length) {
        return this._src;
    }

    this._src = arguments;
    return this;
};

/**
 * Add a plugin to the middleware stack
 *
 * @param {Function} plugin plugin
 * @return {Object} fontmin
 * @api public
 */
Fontmin.prototype.use = function (plugin) {
    this.streams.push(typeof plugin === 'function' ? plugin() : plugin);
    return this;
};

/**
 * Optimize files
 *
 * @return {Stream} file stream
 * @api public
 */
Fontmin.prototype.run = function (text) {
    var stream = this.createStream(text);
    return stream;
};

/**
 * Create stream
 *
 * @return {Stream} file stream
 * @api private
 */
Fontmin.prototype.createStream = async function (text) {
    // this.streams.unshift();
    let fontBuffer = await this.getFiles();
    console.log(fontBuffer);
    let min = Fontmin.glyph({ 
        text,
        hinting: false         // keep ttf hint info (fpgm, prep, cvt). default = true
    }, fontBuffer)
    return min

    // if (this.streams.length === 1) {
    //     this.use(Fontmin.otf2ttf());
    //     this.use(Fontmin.ttf2eot());
    //     this.use(Fontmin.ttf2woff());
    //     this.use(Fontmin.ttf2woff2());
    //     this.use(Fontmin.ttf2svg());
    //     this.use(Fontmin.css());
    // }
    // return combine(this.streams);
};

/**
 * Get files
 *
 * @return {Stream} file stream
 * @api private
 */
Fontmin.prototype.getFiles = async function () {
  if (this._src[0].constructor === ArrayBuffer) {
    return this._src[0]
  }
  return await fetch(this._src[0]).then(res=> res.arrayBuffer());
};

/**
 * plugins
 *
 * @type {Array}
 */
Fontmin.plugins = [
    'glyph',
    // 'ttf2eot',
    // 'ttf2woff',
    // 'ttf2woff2',
    // 'ttf2svg',
    // 'css',
    // 'svg2ttf',
    // 'svgs2ttf',
    // 'otf2ttf'
];

// export pkged plugins
Fontmin.plugins.forEach(function (plugin) {
    Fontmin[plugin] = require('./plugins/' + plugin);
});

/**
 * Module exports
 */
module.exports = Fontmin;


// exports util, mime
module.exports.util = exports.util = require('./lib/util');
module.exports.mime = exports.mime = require('./lib/mime-types');
