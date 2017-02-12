/**
 * ***** Babelute HTML5 DSL lexicon *****
 *
 * 
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */
/**
 * @external {Lexicon} https://github.com/nomocas/babelute
 */
import { createLexicon } from 'babelute/src/lexicon/lexicon';
import { castNodeValueTo } from './pragmatics/dom-utils'; // only used in contentEditable. safe for server and string output usage.

/**
 * html lexicon
 * @type {Lexicon}
 * @public
 * @see  https://github.com/nomocas/babelute-html
 */
const htmlLexicon = createLexicon('html');

/*******
 *******	LANGUAGE ATOMS
 *******/
htmlLexicon.atomsList = ['tag', 'attr', 'prop', 'data', 'class', 'id', 'style', 'text', 'on', 'onDom', 'onString', 'if', 'each', 'html']; // we store it just because it could be usefu

htmlLexicon.addAtoms(htmlLexicon.atomsList);

/*******
 *******	COMPOUNDS WORDS (based on language atoms)
 *******/
// simple tags (made with .tag) (list should be completed)
htmlLexicon.tagsList = ['body', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'section', 'span', 'button', 'main', 'article', 'hr', 'header', 'footer', 'label', 'ul', 'li', 'p', 'small', 'b', 'strong', 'i', 'u', 'select', 'title', 'meta'];
// events (made with .on) (list should be completed)
htmlLexicon.eventsList = ['click', 'blur', 'focus', 'submit', 'mouseover', 'mousedown', 'mouseup', 'mouseout', 'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove', 'drop', 'dragover', 'dragstart'];

htmlLexicon
	.addCompounds(() => {
		const methods = {};
		htmlLexicon.tagsList.forEach((tagName) => {
			methods[tagName] = function() {
				return this._append('html', 'tag', [tagName, arguments]);
			};
		});
		htmlLexicon.eventsList.forEach((eventName) => {
			methods[eventName] = function(handler, argument) {
				return this._append('html', 'on', [eventName, handler, argument]);
			};
		});
		return methods;
	})
	.addCompounds((h) => {
		return {
			/**
			 * a link tag
			 * @public
			 * @implements {htmlLexicon}
			 * @param  {String} href     the link's href
			 * @param  {String} rel      this link's rel
			 * @param  {?Babelute} babelute an optional babelute to apply on tag
			 * @return {Babelute}          current babelute
			 */
			link(href, rel, babelute) {
				return this.tag('link', [h.attr('href', href).attr('rel', rel), babelute]);
			},
			linkCSS(href) {
				return this.link(href, 'stylesheet', h.attr('type', 'text/css'));
			},
			input(type, val, babelute) {
				return this.tag('input', [h.attr('type', type).attr('value', val), babelute]);
			},
			textInput(val, babelute) {
				return this.input('text', val, babelute);
			},
			passwordInput(val, babelute) {
				return this.input('password', val, babelute);
			},
			checkbox(checked, babelute) {
				return this.tag('input', [h.attr('type', 'checkbox').prop('checked', !!checked), babelute]);
			},
			radio(checked, babelute) {
				return this.tag('input', [h.attr('type', 'radio').prop('checked', !!checked), babelute]);
			},
			option(value, content, selected) {
				return this.tag('option', [h.attr('value', value).prop('selected', !!selected), content]);
			},
			script(src, content) {
				return this.tag('script', [h.attr('src', src).attr('type', 'text/javascript'), content]);
			},
			a() {
				arguments[0] = h.attr('href', arguments[0]);
				return this.tag('a', arguments);
			},
			img() {
				arguments[0] = h.attr('src', arguments[0]);
				return this.tag('img', arguments);
			},
			nbsp() {
				return this.text('\u00A0');
			},
			visible(yes) {
				return this.style('visibility', yes ? 'visible' : 'hidden');
			},
			display(flag) {
				return this.style('display', typeof flag === 'string' ? flag : (flag ? 'block' : 'none'));
			},
			contentEditable(opt /*{ value, updateHandler, valueType = "text"[|"html"|"integer"], updateOnEvent = "blur", isEditable = true } */ ) {
				return this.prop('contentEditable', opt.isEditable !== false)
					.prop(opt.valueType === 'html' ? 'innerHTML' : 'textContent', opt.value || '')
					.on(opt.updateOnEvent || 'blur', (e) => {
						opt.updateHandler(castNodeValueTo(e.currentTarget, opt.valueType || 'text'));
					})
					.click((e) => {
						if (opt.isEditable !== false) {
							e.preventDefault();
							e.stopPropagation();
						}
					});
			}
		};
	});

htmlLexicon.eventsList.forEach((eventName) => {
	htmlLexicon.FirstLevel.prototype[eventName] = function(handler, argument) {
		return this._append('html', 'on', [eventName, handler, argument]);
	};
});

htmlLexicon.tagsList.forEach((tagName) => {
	htmlLexicon.FirstLevel.prototype[tagName] = function() {
		return this._append('html', 'tag', [tagName, arguments]);
	};
});

export default htmlLexicon;

