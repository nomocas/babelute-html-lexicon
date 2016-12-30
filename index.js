/**
 * Use this file when you want to load everything needed to start a babelute-html project without loading yet a rendering engine.
 */
var Babelute = require('babelute'); // core
require('./lib/html'); // html dsl lexicon
module.exports = Babelute;