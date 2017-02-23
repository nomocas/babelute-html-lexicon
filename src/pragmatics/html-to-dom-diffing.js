/**
 * Babelute HTML Dom Diffing Pragmatics
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 */

import htmlLexicon from '../html-lexicon';
import bbl from 'babelute';
import { insertHTML } from './dom-utils'; // only used in contentEditable. safe for server and string output usage.

/**
 * @external {Pragmatics} https://github.com/nomocas/babelute
 */

const Scopes = bbl.Scopes,
	h = htmlLexicon.Atomic.initializer, // only needed for .text() in tag's children
	_targets = {
		html: true
	};

//______________________________________________ RENDER STRATEGY

const renderActions = {
	// Atoms rendering
	class($tag, lexem) {
		const args = lexem.args; /* className */
		if (args[0] && (args.length === 1 || args[1]))
			$tag.classList.add(args[0]);
	},
	attr($tag, lexem) {
		const args = lexem.args; /* name, value */
		$tag.setAttribute(args[0], args[1]);
	},
	prop($tag, lexem) {
		const args = lexem.args; /* name, value */
		$tag[args[0]] = args[1];
	},
	data($tag, lexem) {
		const args = lexem.args; /* name, value */
		$tag.dataset[args[0]] = args[1];
	},
	style($tag, lexem) {
		const args = lexem.args; /* name, value */
		$tag.style[args[0]] = args[1];
	},
	id($tag, lexem) {
		$tag.id = lexem.args[0];
	},
	on($tag, lexem) {
		const args = lexem.args; /* eventName, callback */
		const closure = lexem.closure = { handler: args[1], arg:args[2] };
		lexem.listener = function(e) {
			return closure.handler.call(this, e, closure.arg);
		};
		$tag.addEventListener(args[0], lexem.listener);
	},

	// structural render actions
	tag($tag, lexem, scopes, frag) {
		lexem.child = document.createElement(lexem.args[0]);
		(frag || $tag).appendChild(lexem.child);
		const babelutes = lexem.args[1];
		for (let i = 0, len = babelutes.length, babelute; i < len; ++i) {
			babelute = babelutes[i];
			if (typeof babelute === 'undefined') // cast undefined to '' to keep track of node for diffing
				babelute = '';
			if (!babelute || !babelute.__babelute__) // text node
				babelute = babelutes[i] = h.text(babelute);
			render(lexem.child, babelute, scopes);
		}
	},

	text($tag, lexem, scopes, frag) {
		lexem.child = document.createTextNode(lexem.args[0]);
		(frag || $tag).appendChild(lexem.child);
	},

	if ($tag, lexem, scopes, frag) {
		const toRender = lexem.args[0] ? lexem.args[1] : (lexem.args[2] ? lexem.args[2] : null);
		if (toRender) {
			lexem.developed = (typeof toRender === 'function') ? toRender() : toRender;
			render($tag, lexem.developed, scopes, frag);
		}
		lexem.witness = document.createComment('if');
		$tag.appendChild(lexem.witness);
	},

	each($tag, lexem, scopes, frag) {
		const args = lexem.args;
		lexem.children = [];
		const collection = args[0] = args[0] || [],
			itemRender = args[1];
		for (let i = 0, len = collection.length, rendered; i < len; ++i) {
			rendered = itemRender(collection[i]);
			lexem.children.push(rendered);
			render($tag, rendered, scopes, frag);
		}
		lexem.witness = document.createComment('each');
		$tag.appendChild(lexem.witness);
	},

	// custom output
	onDom($tag, lexem, scopes, frag /* args = render, dif, remove */ ) {
		const onRender = lexem.args[0];
		if (onRender)
			onRender($tag, lexem, scopes, frag);
	},
	html($tag, lexem) {
		lexem.children = insertHTML(lexem.args[0], $tag);
	},
	execute($tag, lexem) {
		lexem.args[0].apply(null, lexem.args[1]);
	}
};

function render($tag, babelute, scopes, frag) {
	for (let i = 0, action, lexem, lexems = babelute._lexems, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (!_targets[lexem.lexicon])
			continue;
		action = renderActions[lexem.name];
		if (action)
			action($tag, lexem, scopes, frag);
		else { // no actions means it's a compound lexem : so recursion on first degree dev.
			lexem.developed = bbl.developOneLevel(lexem, _targets[lexem.lexicon]);
			render($tag, lexem.developed, scopes, frag);
		}
	}
}

//______________________________________________ DIF STRATEGY

/**
 * difActions
 * @public
 * @type {Object}
 */
const difActions = {
	// structurals
	if ($tag, lexem, olexem, scopes) {
		lexem.witness = olexem.witness;
		const args = lexem.args,
			oargs = olexem.args;
		let toRender;
		if (!args[0] !== !oargs[0]) { // condition has change
			if (!args[0] || oargs[2]) // if condition was true (there is a success babelute that was rendered) OR it was false and there is an elseBabelute in olexem that was rendered
				remove($tag, olexem.developed, scopes); // remove old babelute (either "success or else" babelute)
			toRender = args[0] ? args[1] : args[2]; // if condition is true take "success babelute", else take "else babelute"
			if (toRender) { // render : add children tags to fragment then add to $tag + add attributes (and co) directly to $tag.
				const frag = document.createDocumentFragment();
				lexem.developed = (typeof toRender === 'function') ? toRender() : toRender;
				render($tag, lexem.developed, scopes, frag);
				$tag.insertBefore(frag, lexem.witness);
			}
		} else { // no change so dif rendered babelutes
			toRender = args[0] ? args[1] : args[2];
			if (toRender) {
				lexem.developed = (typeof toRender === 'function') ? toRender() : toRender;
				dif($tag, lexem.developed, olexem.developed, scopes);
			}
		}
	},

	each($tag, lexem, olexem, scopes) {
		const collection = lexem.args[0],
			renderItem = lexem.args[1],
			ochildren = olexem.children,
			len = collection.length,
			olen = ochildren.length,
			children = lexem.children = new Array(len);

		let rendered,
			frag,
			item,
			i = 0;

		lexem.witness = olexem.witness; // keep track of witness

		if (len > olen) // create fragment for new items
			frag = document.createDocumentFragment();
		for (; i < len; ++i) { // for all items (from new lexem)
			item = collection[i];
			rendered = renderItem(item); // render firstdegree item
			children[i] = rendered; // keep new rendered for next diffing
			if (i < olen) // dif existing children
				dif($tag, rendered, ochildren[i], scopes);
			else // full render new item and place produced tags in fragment 
				render($tag, rendered, scopes, frag); // ($tag is forwarded for first level non-tags atoms lexems (aka class, attr, ...))
		}
		for (; i < olen; ++i) // remove not diffed old children
			remove($tag, ochildren[i], scopes);
		if (frag) // insert new children fragment (if any)
			$tag.insertBefore(frag, lexem.witness);
	},

	tag($tag, lexem, olexem, scopes) {
		lexem.child = olexem.child; // keep track of elementNode
		const babelutes = lexem.args[1],
			obabelutes = olexem.args[1];

		let babelute, obabelute;
		for (let i = 0, len = babelutes.length; i < len; i++) {
			// render all children's babelutes
			babelute = babelutes[i];
			obabelute = obabelutes[i];
			if (babelute === obabelute)
				continue;
			if (typeof babelute === 'undefined') // cast undefined to empty string
				babelute = '';
			if (!babelute || !babelute.__babelute__)
				babelute = babelutes[i] = h.text(babelute);
			dif(lexem.child, babelute, obabelute, scopes);
		}
	},

	text($tag, lexem, olexem) {

		const newText = lexem.args[0];

		lexem.child = olexem.child; // keep track of textnode
		if (newText !== olexem.args[0])
			lexem.child.nodeValue = newText;
	},

	// html simple atoms diffing
	class($tag, lexem, olexem) {

		const name = lexem.args[0], // new class name
			oname = olexem.args[0], // old class name
			flag = lexem.args[1], // new class flag
			oflag = olexem.args[1]; // old class flag

		if (name !== oname) {
			if (oname)
				$tag.classList.remove(oname);
			if (name && (lexem.args.length === 1 || flag))
				$tag.classList.add(name);
		} else if (name && lexem.args.length > 1 && !flag !== !oflag)
			$tag.classList.toggle(name);
	},

	attr($tag, lexem, olexem) {
		const name = lexem.args[0],
			value = lexem.args[1],
			oname = olexem.args[0],
			ovalue = olexem.args[1];

		if (name !== oname) {
			$tag.removeAttribute(oname);
			$tag.setAttribute(name, value);
		} else if (value !== ovalue)
			$tag.setAttribute(name, value);
	},

	prop($tag, lexem, olexem) {

		const name = lexem.args[0],
			value = lexem.args[1],
			oname = olexem.args[0];

		if (name !== oname) {
			delete $tag[oname];
			$tag[name] = value;
		} else if (value !== $tag[name] /*olexem.args[1]*/ ) // look diectly in element : for "checked" bug (or other properties that change on native interaction with element)
			$tag[name] = value;
	},

	data($tag, lexem, olexem) {

		const name = lexem.args[0],
			value = lexem.args[1],
			oname = olexem.args[0],
			ovalue = olexem.args[1];

		if (name !== oname) {
			delete $tag.dataset[oname];
			$tag.dataset[name] = value;
		} else if (value !== ovalue)
			$tag.dataset[name] = value;
	},

	style($tag, lexem, olexem) {
		const name = lexem.args[0],
			value = lexem.args[1],
			oname = olexem.args[0],
			ovalue = olexem.args[1];

		if (name !== oname) {
			delete $tag.style[oname];
			$tag.style[name] = value;
		} else if (value !== ovalue)
			$tag.style[name] = value;
	},

	id($tag, lexem, olexem) {
		const id = lexem.args[0];
		if (id !== olexem.args[0])
			$tag.id = id;
	},

	on($tag, lexem, olexem) {
		const name = lexem.args[0],
			oname = olexem.args[0];

		if (name !== oname) {
			$tag.removeEventListener(oname, olexem.listener);
			renderActions.on($tag, lexem);
		} else {
			const closure = lexem.closure = olexem.closure;
			lexem.listener = olexem.listener;
			closure.handler = lexem.args[1];
			closure.arg = lexem.args[2];
		}
	},

	onDom($tag, lexem, olexem /* args = render, dif, remove */ ) {
		const dif = lexem.args[1];
		if (dif)
			dif($tag, lexem, olexem);
	},

	html($tag, lexem, olexem) {
		const newHTML = lexem.args[0];
		if (olexem.args[0] !== newHTML) {
			const lastChild = olexem.children ? olexem.children[olexem.children.length - 1] : null,
				nextSibling = lastChild ? lastChild.nextSibling : null;
			olexem.children && olexem.children.forEach((child) => $tag.removeChild(child));
			lexem.children = insertHTML(newHTML, $tag, nextSibling);
		}
	},
	execute($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0] || !argsChanged(lexem.args[1], olexem.args[1]))
			return;
		lexem.args[0].apply(null, lexem.args[1]);
	}
};

function dif($tag, babelute, oldb, scopes) {
	for (let lexem, olexem, action, i = 0, len = babelute._lexems.length; i < len; ++i) {
		lexem = babelute._lexems[i];
		if (!_targets[lexem.lexicon])
			continue;
		olexem = oldb._lexems[i];
		if (!lexem.args.length) // wathever lexem is : no args implies never change, so keep old rendered
			lexem.developed = olexem.developed;
		else {
			action = difActions[lexem.name]; // structural or atom diffing action
			if (action) // let strategy action do the job
				action($tag, lexem, olexem, scopes);
			else if (argsChanged(lexem.args, olexem.args)) {
				// no action means compounds first degree lexem. so check args dif...
				lexem.developed = bbl.developOneLevel(lexem, _targets[lexem.lexicon]);
				dif($tag, lexem.developed, olexem.developed, scopes);
			} else // keep old rendered (compounds args haven't changed : so nothing to do)
				lexem.developed = olexem.developed;
		}
	}
}

function argsChanged(args, oargs) {
	for (let i = 0, len = args.length; i < len; ++i)
		if (args[i] !== oargs[i]) // simple reference check : need immutables
			return true;
	return false;
}

//______________________________________________ REMOVE STRATEGY

const removeActions = {
	attr($tag, lexem) {
		$tag.removeAttribute(lexem.args[0]);
	},
	class($tag, lexem) {
		if (lexem.args[0])
			$tag.classList.remove(lexem.args[0]);
	},
	prop($tag, lexem) {
		delete $tag[lexem.args[0]];
	},
	data($tag, lexem) {
		delete $tag.dataset[lexem.args[0]];
	},
	style($tag, lexem) {
		delete $tag.style[lexem.args[0]];
	},
	id($tag) {
		delete $tag.id;
	},
	on($tag, lexem) {
		$tag.removeEventListener(lexem.args[0], lexem.listener);
	},
	each($tag, lexem, scopes) {
		lexem.children.forEach((child) => remove($tag, child, scopes));
	},
	onDom($tag, lexem /* render, dif, remove */ ) {
		const remove = lexem.args[2];
		if (remove)
			remove($tag, lexem);
	},
	html($tag, lexem) {
		if (lexem.children)
			lexem.children.forEach((child) => $tag.removeChild(child));
	}
};

function remove($tag, babelute, scopes) {
	for (let i = 0, lexems = babelute._lexems, lexem, action, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (!_targets[lexem.lexicon])
			continue;
		action = removeActions[lexem.name];
		if (action) // class, attr, id, prop, data, each, and .on
			action($tag, lexem, scopes);
		else if (lexem.developed) { // compounds and if
			remove($tag, lexem.developed, scopes);
			lexem.developed = null;
		} else if (lexem.child) { // tag and text
			$tag.removeChild(lexem.child);
			lexem.child = null;
		}
		if (lexem.witness) // if, each
			$tag.removeChild(lexem.witness);
	}
}

//______________________________________________

/**
 * DomDiffing Pragmatics instance
 * @public
 * @type {Pragmatics}
 * @todo  addTargetLexicon(lexicon) => catch name for _targets + store lexicon reference for one level developement : no more need to register lexicons globally
 * @example
 * import difPragmas from 'babelute-html/src/html-to-dom-diffing.js';
 * import htmlLexicon from 'babelute-html/src/html-lexicon.js';
 *
 * const h = htmlLexicon.firstLevelInitializer;
 * let oldRendered, // for diffing tracking
 * 	animFrame;
 *
 * function update(state) {
 * 	if (animFrame)
 * 		cancelAnimationFrame(animFrame);
 * 	animFrame = requestAnimationFrame(() => {
 * 		const newRendered = h.div(state.intro).section(h.class('my-section').h1(state.title));
 * 		oldRendered = difPragmas.$output($root, newRendered, oldRendered);
 * 	});
 * }
 * 
 * update(myState);
 */
const difPragmas = bbl.createPragmatics(_targets, {
	$output($tag, babelute, oldBabelute, scopes) {
		scopes = scopes || new Scopes(this._initScopes ? this._initScopes() : null);
		oldBabelute ? dif($tag, babelute, oldBabelute, scopes) : render($tag, babelute, scopes);
		return babelute;
	},
	addLexicon(lexicon, name) {
		this._targets[name || lexicon.name] = lexicon;
		while (lexicon.parent) {
			lexicon = lexicon.parent;
			this._targets[lexicon.name] = lexicon;
		}
	},
	render,
	dif,
	remove,
	renderActions,
	difActions,
	removeActions
});

export default difPragmas;

