/**
 * ***** Babelute HTML5 DSL lexicon *****
 *
 * 
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */

var Babelute = require('babelute');

/*******
 *******	LANGUAGE ATOMS
 *******/
Babelute.toLexic('html', ['tag', 'attr', 'prop', 'data', 'class', 'id', 'style', 'text', 'on', 'onDom', 'onString']);

/*******
 *******	COMPOUNDS WORDS (based on language atoms)
 *******/
// simple tags (made with .tag) (list should be completed)
var tagsList = ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'section', 'span', 'button', 'main', 'article', 'hr', 'header', 'footer', 'label', 'ul', 'li', 'p', 'small', 'b', 'strong', 'i', 'u', 'select', 'title', 'meta'];
tagsList.forEach(function(tagName) {
	Babelute.toLexic('html', tagName, function() {
		return this.tag(tagName, arguments);
	});
});

// events (made with .on) (list should be completed)
var eventsList = ['click', 'mouseup', 'mousedown', 'mouseover', 'keyup', 'keydown'];
eventsList.forEach(function(eventName) {
	Babelute.toLexic('html', eventName, function(callback) {
		return this.on(eventName, callback);
	});
});

// compounds tags (made with other lexems)
var h = Babelute.initializer('html');
Babelute.toLexic('html', {
	link: function(href, rel, babelute) {
		return this.tag('link', [h.attr('href', href).attr('rel', rel), babelute]);
	},
	linkCSS: function(href) {
		return this.link(href, 'stylesheet', h.attr('type', 'text/css'));
	},
	favicon: function(href) {
		return this.link(href, 'shortcut icon', h.attr('type', 'image/x-icon'));
	},
	input: function(type, val, babelute) {
		return this.tag('input', [h.attr('type', type).attr('value', val), babelute]);
	},
	textInput: function(val, babelute) {
		return this.input('text', val, babelute);
	},
	passwordInput: function(val, babelute) {
		return this.input('password', val, babelute);
	},
	checkbox: function(checked, babelute) {
		return this.tag('input', [h.attr('type', 'checkbox').prop('checked', !!checked), babelute]);
	},
	radio: function(checked, babelute) {
		return this.tag('input', [h.attr('type', 'radio').prop('checked', !!checked), babelute]);
	},
	option: function(value, content, selected) {
		return this.tag('option', [h.attr('value', value).prop('selected', !!selected), content]);
	},
	visible: function(yes) {
		return this.prop('visibility', !!yes ? 'visible' : 'hidden');
	},
	metaKeywords: function(keywords) {
		return this.meta(h.attr('name', 'keywords').attr('content', keywords.join ? keywords.join(', ') : keywords));
	},
	metaDescription: function(description) {
		return this.meta(h.attr('name', 'description').attr('content', description));
	},
	metaAuthor: function(author) {
		return this.meta(h.attr('name', 'author').attr('content', author));
	},
	metaViewport: function(viewport) {
		return this.meta(h.attr('name', 'viewport').attr('content', viewport || 'width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0'));
	},
	metaContentType: function(type) {
		return this.meta(h.attr('http-equiv', 'content-type').attr('content', type || 'text/html; charset=utf-8'));
	},
	script: function(src, content) {
		return this.tag('script', [
			h.attr('src', src)
			.attr('type', 'text/javascript'),
			content
		]);
	},
	a: function(href) {
		var args = [].slice.call(arguments, 1);
		args.unshift(h.attr('href', href));
		return this.tag('a', args);
	},
	img: function(src) {
		var args = [].slice.call(arguments, 1);
		args.unshift(h.attr('src', src));
		return this.tag('img', args);
	},
	nbsp: function() {
		return this.text('\u00A0');
	}
});

module.exports = Babelute;


/********************
 * Small First degree optimisation for diffing (bypass inner degrees developement) (don't look if you're new with babelute ;))
 * Optional.
 *********************/
var lexic = Babelute.getLexic('html');
// small first degree optimisation (bypass .tag(._append()))
tagsList.forEach(function(name) {
	lexic.FirstDegree.prototype[name] = function() {
		this._lexems.push(new Babelute.Lexem('html', 'tag', [name, arguments]));
		return this;
	};
});
// small first degree optimisation (bypass .on(._append()))
eventsList.forEach(function(eventName) {
	lexic.FirstDegree.prototype[eventName] = function(handler, argument) {
		this._lexems.push(new Babelute.Lexem('html', 'on', [eventName, handler, argument]));
		return this;
	};
});