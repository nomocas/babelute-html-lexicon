/**
 ************* HTML-to-String Actions ***********
 *
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */

var Babelute = require('babelute/lib/babelute'),
	SimpleFacadePragmatics = require('babelute-pragmatics/lib/facade-pragmatics');

// we only need logical atoms definitions. (without user interactions. aka click etc.)
module.exports = Babelute.extendPragmatics(SimpleFacadePragmatics, {
	// Output engines related
	_targetLexics: {
		default: true,
		html: true
	},
	// Actions
	tag: function(tag, args /* tagName, babelutes */ , env) {
		var child = new TagDescriptor(),
			actions = env.actions,
			babelutes = args[1],
			templ,
			self = this;
		for (var i = 0, len = babelutes.length; i < len; ++i) {
			templ = babelutes[i];
			if (typeof templ === 'undefined')
				continue;
			if (templ.__babelute__)
				self.$output(templ, child, env);
			else if (typeof templ === 'string')
				child.children += encodeHtmlSpecialChars(templ); //.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			else
				child.children += templ;
		}
		tagOutput(tag, child, args[0]);
	},
	text: function(tag, args /* value */ ) {
		tag.children += encodeHtmlSpecialChars(args[0]);
	},
	class: function(tag, args /* className */ ) {
		tag.classes += ' ' + args[0];
	},
	prop: function(tag, args) {

	},
	data: function(tag, args) {

	},
	attr: function(tag, args /* name, value */ ) {
		var value = args[1];
		// tag.attributes += ' ' + args[0] + '="' + (typeof value === 'string' ? encodeHtmlSpecialChars(value) : value) + '"';
		tag.attributes += ' ' + args[0] + '="' + (typeof value === 'string' ? value.replace(/"/g, '\\"').replace(/</g, '&lt;').replace(/>/g, '&gt;') : value) + '"';
	},
	id: function(tag, args /* value */ ) {
		tag.attributes = ' id="' + args[0] + '"' + tag.attributes;
	},
	$output: function(babelute, descriptor, env) {
		return SimpleFacadePragmatics.$output.call(this, babelute, descriptor || new TagDescriptor(), env).children;
	}
});

// for tags string construction
function TagDescriptor(tagName) {
	this.children = '';
	this.classes = '';
	this.style = '';
	this.attributes = '';
};

var openTags = /br/, // should be completed
	strictTags = /span|script|meta|div|i/;

function tagOutput(tag, child, name) {
	var out = '<' + name + child.attributes;
	if (child.style)
		out += ' style="' + child.style + '"';
	if (child.classes)
		out += ' class="' + child.classes + '"';
	if (child.children)
		tag.children += out + '>' + child.children + '</' + name + '>';
	else if (openTags.test(name))
		tag.children += out + '>';
	else if (strictTags.test(name))
		tag.children += out + '></' + name + '>';
	else
		tag.children += out + '/>';
}

// utils :
var mapEncode = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;" // ' -> &apos; for XML only
	},
	mapDecode = {
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&quot;": "\"",
		"&#39;": "'"
	};

function encodeHtmlSpecialChars(str) {
	return str.replace(/[&<>"']/g, function(m) {
		return mapEncode[m];
	});
}

function decodeHtmlSpecialChars(str) {
	return str.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;)/g, function(m) {
		return mapDecode[m];
	});
}

//