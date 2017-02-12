/**
 * ***** Babelute HTML Meta tags DSL *****
 *
 * 
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */

import babelute from 'babelute';
import htmlLexicon from './html-lexicon.js';

/**
 * html meta-tags dedicated lexicon. Extending htmlLexicon.
 * @type {Lexicon}
 * @public
 */
const htmlMetaLexicon = babelute.createLexicon('html-meta', htmlLexicon);

htmlMetaLexicon.addCompounds((h) => {
	return {
		/**
		 * add favicon tag (link)
		 * @public
		 * @param  {string} href the favicon href
		 * @return {Babelute}      the current babelute
		 */
		favicon(href) {
			return this.link(href, 'shortcut icon', h.attr('type', 'image/x-icon'));
		},
		keywords(keywords) {
			return this.meta(h.attr('name', 'keywords').attr('content', keywords.join ? keywords.join(', ') : keywords));
		},
		description(description) {
			return this.meta(h.attr('name', 'description').attr('content', description));
		},
		author(author) {
			return this.meta(h.attr('name', 'author').attr('content', author));
		},
		viewport(viewport) {
			return this.meta(h.attr('name', 'viewport').attr('content', viewport || 'width=device-width, initial-scale=1.0, maximum-scale=1, minimum-scale=1, user-scalable=0'));
		},
		contentType(type) {
			return this.meta(h.attr('http-equiv', 'content-type').attr('content', type || 'text/html; charset=utf-8'));
		},
		robots(content) {
			return this.meta(h.attr('name', 'robots').attr('content', content || 'index,follow'));
		},
		xuaCompatible(content) {
			return this.meta(h.attr('http-equiv', 'X-UA-Compatible').attr('content', content || 'IE=edge,chrome=1'));
		},
		pageHead(title, description, keywords, author) {
			return this
				.contentType()
				.viewport()
				.robots()
				.xuaCompatible()
				.title(title)
				.description(description)
				.keywords(keywords)
				.author(author);
		},
		opengraph(name, value) {
			return this.meta(name, value);
		},
		facebook(data) {
			return this.meta(data);
		},
		twitter(data) {
			return this.meta(data);
		},
		googleplus(data) {
			return this.meta(data);
		}
	};
});

export default htmlMetaLexicon;

