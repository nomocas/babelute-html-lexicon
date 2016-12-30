var Babelute = require('babelute'); // core
require('../lib/html'); // html dsl lexicon
var dif = require('../lib/pragmatics/html-to-dom-diffing'); // dom diffing
module.exports = {
	Babelute: Babelute,
	htmlToDomDiffing: dif
};