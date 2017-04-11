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
import bbl from 'babelute';
import { castNodeValueTo } from 'nomocas-webutils/lib/dom-utils'; // only used in contentEditable. safe for server and string output usage.

/**
 * html lexicon
 * @type {Lexicon}
 * @public
 * @see  https://github.com/nomocas/babelute-html
 */
const htmlLexicon = bbl.createLexicon('html');

/*******
 *******	LANGUAGE ATOMS
 *******/
htmlLexicon.addAtoms(['tag', 'attr', 'prop', 'data', 'class', 'classes', 'id', 'style', 'text', 'onDom', 'onString', 'if', 'each', 'keyedEach', 'html', 'component', 'ref', 'container', 'client', 'server']);

/*******
 *******	COMPOUNDS WORDS (based on language atoms)
 *******/
// simple tags (made with .tag) (list should be completed if needed)
htmlLexicon.tagsList = ['body', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'section', 'span', 'button', 'main', 'article', 'hr', 'header', 'footer', 'label', 'ul', 'li', 'p', 'small', 'b', 'strong', 'i', 'u', 'title', 'meta', 'table', 'tr', 'td', 'tbody', 'form', 'br'];
// events (made with .on) (list should be completed if needed)
htmlLexicon.eventsList = ['click', 'blur', 'focus', 'submit', 'mouseover', 'mousedown', 'mouseup', 'mouseout', 'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove', 'drop', 'dragover', 'dragstart'];

htmlLexicon
	.addAliases({
		execute(method, ...args) {
			return this._append('html', 'execute', [method, args]);
		},
		switchUse(lexemRef, ...args) {
			return this._append('html', 'switchUse', [lexemRef, args]);
		},
		on(eventName, callback, ...args) {
			return this._append('html', 'on', [eventName, callback, args]);
		}
	})
	.addCompounds(() => {
		const methods = {};
		htmlLexicon.tagsList.forEach((tagName) => {
			methods[tagName] = function() {
				return this._append('html', 'tag', [tagName, arguments]);
			};
		});
		htmlLexicon.eventsList.forEach((eventName) => {
			methods[eventName] = function(callback, ...args) {
				return this._append('html', 'on', [eventName, callback, args]);
			};
		});
		return methods;
	})
	.addCompounds((h) => {
		return {
			select(selected, options, babelute = undefined) {
				if (arguments.length === 1) // use a simple tag that receive a babelute as child (first arg)
					return this.tag('select', [selected]);
				return this.tag('select', [
					h.each(options, (option) => {
						return h.option(option.value, option.label, option.value === selected);
					}),
					babelute
				]);
			},
			link(href, rel, babelute) {
				return this.tag('link', [h.attr('href', href).attr('rel', rel), babelute]);
			},
			linkCSS(href) {
				return this.link(href, 'stylesheet', h.attr('type', 'text/css'));
			},
			input(type, val, babelute) {
				return this.tag('input', [h.attr('type', type).prop('value', val), babelute]);
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
			disabled(flag) {
				return this.prop('disabled', !!flag);
			},
			contentEditable(opt /*{ value, updateHandler, valueType = "text"[|"html"|"integer"], updateOnEvent = "blur", isEditable = true, placeholder = '...' } */ ) {
				const contentProperty = opt.valueType === 'html' ? 'innerHTML' : 'textContent';
				return this
					.prop('contentEditable', !!opt.isEditable)
					.prop(contentProperty, opt.value || opt.placeholder || '')
					.on(opt.updateOnEvent || 'blur', (e) => {
						const val = castNodeValueTo(e.currentTarget, opt.valueType || 'text');
						if (val !== opt.value)
							opt.updateHandler(val);
						else if (val === '')
							e.currentTarget[contentProperty] = opt.placeholder || '';
					})
					.click((e) => {
						if (opt.isEditable) {
							if (opt.placeholder && e.currentTarget[contentProperty] === opt.placeholder)
								e.currentTarget[contentProperty] = '';
						}
					});
			}
		};
	});

// htmlLexicon.tagsList.forEach((tagName) => {
// 	htmlLexicon.FirstLevel.prototype[tagName] = function() {
// 		return this._append('html', 'tag', [tagName, arguments]);
// 	};
// });

export default htmlLexicon;

