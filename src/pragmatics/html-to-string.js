/**
 ************* HTML-to-String Actions ***********
 *
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */

import HTMLScopes from './html-scopes.js';
import FacadePragmatics from 'babelute/src/pragmatics/facade-pragmatics';
import toSlugCase from 'to-slug-case'; // for data-* attributes
import htmlSpecialChars from 'nomocas-utils/lib/string/html-special-chars'; // for safe string output

export default new FacadePragmatics({
	html: true
}, {
	// we only need logical atoms definitions. (without user interactions. aka click etc.)
	tag(tag, args /* tagName, babelutes */ , env) {
		const child = new TagDescriptor(),
			babelutes = args[1];
		let templ;
		for (let i = 0, len = babelutes.length; i < len; ++i) {
			templ = babelutes[i];
			if (typeof templ === 'undefined')
				continue;
			if (templ && templ.__babelute__)
				this.$output(child, templ, env);
			else if (typeof templ === 'string')
				child.children += htmlSpecialChars.encode(templ); //.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			else
				child.children += templ;
		}
		tagOutput(tag, child, args[0]);
	},

	text(tag, args /* value */ ) {
		tag.children += htmlSpecialChars.encode(args[0]);
	},

	class(tag, args /* className */ ) {
		tag.classes += ' ' + args[0];
	},

	style(tag, args /* name, value  */ ) {
		tag.style += args[0] + '=' + args[1] + ';';
	},

	prop() {

	},

	data(tag, args) {
		const name = 'data-' + toSlugCase(args[0]),
			value = args[1],
			hasValue = typeof value !== 'undefined';
		tag.attributes += ' ' + name + (hasValue ? ('="' + value + '"') : '');
	},

	attr(tag, args /* name, value */ ) {
		const value = args[1];
		// tag.attributes += ' ' + args[0] + '="' + (typeof value === 'string' ? encodeHtmlSpecialChars(value) : value) + '"';
		tag.attributes += ' ' + args[0] + '="' + (typeof value === 'string' ? value.replace(/"/g, '\\"')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;') : value) + '"';
	},

	id(tag, args /* value */ ) {
		tag.attributes = ' id="' + args[0] + '"' + tag.attributes;
	},

	html(tag, args) {
		tag.children += args[0]; // TODO : should be sanitize
	},

	onString(tag, args /* render */ , env) {
		const onRender = args[0];
		if (onRender)
			onRender(tag, env);
	},

	$output(descriptor, babelute, env) {
		return FacadePragmatics.prototype.$output.call(this, descriptor || new TagDescriptor(), babelute, env || new HTMLScopes()).children;
	}
});



// for tags string construction
class TagDescriptor {
	constructor() {
		this.children = '';
		this.classes = '';
		this.style = '';
		this.attributes = '';
	}
}

// TagDescriptor-to-string output

const openTags = /br/, // should be completed
	strictTags = /span|script|meta|div|i/;

function tagOutput(parent, tag, name) {
	let out = '<' + name + tag.attributes;
	if (tag.style)
		out += ' style="' + tag.style + '"';
	if (tag.classes)
		out += ' class="' + tag.classes + '"';
	if (tag.children)
		parent.children += out + '>' + tag.children + '</' + name + '>';
	else if (openTags.test(name))
		parent.children += out + '>';
	else if (strictTags.test(name))
		parent.children += out + '></' + name + '>';
	else
		parent.children += out + '/>';
}

