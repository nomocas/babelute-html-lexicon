/**
 ************** HTML to DOM Actions ***********
 *
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */

import HTMLScopes from './html-scopes.js';
import FacadePragmatics from 'babelute/src/pragmatics/facade-pragmatics';
import domUtils from './dom-utils'; // only used in contentEditable. safe for server and string output usage.

const domPragmas = new FacadePragmatics({
	html: true
}, {
	// we only need to provides language atoms implementations.
	tag($tag, args /* tagName, babelutes */ , scopes) {
		const child = document.createElement(args[0]),
			babelutes = args[1];
		let templ;
		$tag.appendChild(child);
		for (let i = 0, len = babelutes.length; i < len; ++i) {
			templ = babelutes[i];
			if (typeof templ === 'undefined')
				continue;
			if (templ && templ.__babelute__)
				this.$output(child, templ, scopes);
			else
				child.appendChild(document.createTextNode(templ)); // auto escaped when added to dom.
		}
	},

	text($tag, args /* value */ ) {
		$tag.appendChild(document.createTextNode(args[0])); // auto escaped when added to dom.
	},

	class($tag, args /* className, flag */ ) {
		if (args[0] && (args.length === 1 || args[1]))
			$tag.classList.add(args[0]);
	},

	style($tag, args /* name, value  */ ) {
		$tag.style[args[0]] = args[1];
	},

	attr($tag, args /* name, value */ ) {
		$tag.setAttribute(args[0], args[1]);
	},

	prop($tag, args /* name, value */ ) {
		$tag[args[0]] = args[1];
	},

	data($tag, args /* name, value */ ) {
		$tag.dataset[args[0]] = args[1];
	},

	id($tag, args /* value */ ) {
		$tag.id = args[0];
	},

	on($tag, args /* eventName, callback */ ) {
		$tag.addEventListener(args[0], args[1]);
	},
	// custom output
	onDom($tag, args /* render */ , scopes = null) {
		const onRender = args[0];
		if (onRender)
			onRender($tag, null, scopes);
	},

	$output($tag, babelute, scopes = null) {
		return FacadePragmatics.prototype.$output.call(this, $tag, babelute, scopes || new HTMLScopes()).children;
	},

	html($tag, args) {
		if (args[0])
			domUtils.insertHTML(args[0], $tag);
	}

});

export default domPragmas;

