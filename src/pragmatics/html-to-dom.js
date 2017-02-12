/**
 ************** HTML to DOM Actions ***********
 *
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */

import babelute from 'babelute';
import { insertHTML } from './dom-utils'; // only used in contentEditable. safe for server and string output usage.
/**
 * @external {FacadePragmatics} https://github.com/nomocas/babelute
 */
const Scopes = babelute.Scopes,
	$baseOutput = babelute.FacadePragmatics.prototype.$output; 

/**
 * Dom Pragmatics
 * @type {FacadePragmatics}
 * @public
 * @example
 * import domPragmas from 'babelute-html/src/html-to-dom.js';
 * import htmlLexicon from 'babelute-html/src/html-lexicon.js';
 *
 * const h = htmlLexicon.initializer;
 * const sentence = h.div(state.intro).section(h.class('my-section').h1(state.title));
 * const $root = document.getElementById('foo');
 * 
 * domPragmas.$output($root, sentence);
 */
const domPragmas = babelute.createFacadePragmatics({
	html: true
}, {
	// we only need to provides language atoms implementations.
	/**
	 * insert a tag in node
	 * @public
	 * @param  {DomElement} $tag the parent where insert tag
	 * @param  {arguments} args   lexem arguments : [tagName:String, babelutes:Array<Babelutes>]
	 * @param  {Scopes} scopes the scopes object
	 * @return {[type]}        nothing
	 */
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
		return $baseOutput.call(this, $tag, babelute, scopes || new Scopes(this._initScopes ? this._initScopes() : null)).children;
	},

	html($tag, args) {
		if (args[0])
			insertHTML(args[0], $tag);
	}

});

export default domPragmas;

