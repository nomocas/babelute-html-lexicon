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
		const args = lexem.args; /* value */
		$tag.id = args[0];
	},
	on($tag, lexem) {
		const args = lexem.args; /* eventName, callback */
		$tag.addEventListener(args[0], args[1]);
	},

	// structural render actions
	tag($tag, lexem, env, frag) {
		lexem.child = document.createElement(lexem.args[0]);
		(frag || $tag).appendChild(lexem.child);
		const babelutes = lexem.args[1];
		for (let i = 0, len = babelutes.length, babelute; i < len; ++i) {
			babelute = babelutes[i];
			if (typeof babelute === 'undefined') // cast undefined to '' to keep track of node for diffing
				babelute = '';
			if (!babelute || !babelute.__babelute__) // text node
				babelute = babelutes[i] = h.text(babelute);
			render(lexem.child, babelute, env);
		}
	},

	text($tag, lexem, env, frag) {
		lexem.child = document.createTextNode(lexem.args[0]);
		(frag || $tag).appendChild(lexem.child);
	},

	if ($tag, lexem, env, frag) {
		const toRender = lexem.args[0] ? lexem.args[1] : (lexem.args[2] ? lexem.args[2] : null);
		if (toRender) {
			lexem.developed = (typeof toRender === 'function') ? toRender() : toRender;
			render($tag, lexem.developed, env, frag);
		}
		lexem.witness = document.createComment('if');
		$tag.appendChild(lexem.witness);
	},

	each($tag, lexem, env, frag) {
		const args = lexem.args;
		lexem.children = [];
		const collection = args[0] = args[0] || [],
			itemRender = args[1];
		for (let i = 0, len = collection.length, rendered; i < len; ++i) {
			rendered = itemRender(collection[i]);
			lexem.children.push(rendered);
			render($tag, rendered, env, frag);
		}
		lexem.witness = document.createComment('each');
		$tag.appendChild(lexem.witness);
	},

	// custom output
	onDom($tag, lexem, env, frag /* args = render, dif, remove */ ) {
		const onRender = lexem.args[0];
		if (onRender)
			onRender($tag, lexem, env, frag);
	},
	html($tag, lexem) {
		lexem.children = insertHTML(lexem.args[0], $tag);
	}
};

function render($tag, babelute, env, frag) {
	for (let i = 0, action, lexem, lexems = babelute._lexems, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (!_targets[lexem.lexicon])
			continue;
		action = renderActions[lexem.name];
		if (action)
			action($tag, lexem, env, frag);
		else { // no actions means it's a compound lexem : so recursion on first degree dev.
			lexem.developed = bbl.developOneLevel(lexem);
			render($tag, lexem.developed, env, frag);
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
	if ($tag, lexem, olexem, env) {
		lexem.witness = olexem.witness;
		const args = lexem.args,
			oargs = olexem.args;
		let toRender;
		if (!args[0] !== !oargs[0]) { // condition has change
			if (!args[0] || oargs[2]) // if condition was true (there is a success babelute that was rendered) OR it was false and there is an elseBabelute in olexem that was rendered
				remove($tag, olexem.developed, env); // remove old babelute (either "success or else" babelute)
			toRender = args[0] ? args[1] : args[2]; // if condition is true take "success babelute", else take "else babelute"
			if (toRender) { // render : add children tags to fragment then add to $tag + add attributes (and co) directly to $tag.
				const frag = document.createDocumentFragment();
				lexem.developed = (typeof toRender === 'function') ? toRender() : toRender;
				render($tag, lexem.developed, env, frag);
				$tag.insertBefore(frag, lexem.witness);
			}
		} else { // no change so dif rendered babelutes
			toRender = args[0] ? args[1] : args[2];
			if (toRender) {
				lexem.developed = (typeof toRender === 'function') ? toRender() : toRender;
				dif($tag, lexem.developed, olexem.developed, env);
			}
		}
	},

	/**
	 * each
	 * @public
	 * @param  {[type]} $tag   [description]
	 * @param  {[type]} lexem  [description]
	 * @param  {[type]} olexem [description]
	 * @param  {[type]} env    [description]
	 * @return {[type]}        [description]
	 */
	each($tag, lexem, olexem, env) {
		const collection = lexem.args[0],
			renderItem = lexem.args[1],
			ochildren = olexem.children,
			len = collection.length,
			olen = ochildren.length,
			children = lexem.children = [];
		let rendered,
			frag,
			i = 0;

		lexem.witness = olexem.witness; // keep track of witness
		if (len > olen) // create fragment for new items
			frag = document.createDocumentFragment();
		for (; i < len; ++i) { // for all items (from new lexem)
			rendered = renderItem(collection[i]); // render firstdegree item
			children.push(rendered); // keep new rendered
			if (i < olen) // dif existing children
				dif($tag, rendered, ochildren[i], env);
			else // full render new item and place produced tags in fragment 
				render($tag, rendered, env, frag); // ($tag is forwarded for first level non-tags atoms lexems (aka class, attr, ...))
		}
		for (; i < olen; ++i) // remove not diffed old children
			remove($tag, ochildren[i], env);
		if (frag) // insert new children fragment (if any)
			$tag.insertBefore(frag, lexem.witness);
	},

	tag($tag, lexem, olexem, env) {
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
			dif(lexem.child, babelute, obabelute, env);
		}
	},

	text($tag, lexem, olexem) {
		lexem.child = olexem.child; // keep track of textnode
		if (lexem.args[0] !== olexem.args[0])
			lexem.child.nodeValue = lexem.args[0];
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
		if (lexem.args[0] !== olexem.args[0]) {
			$tag.removeAttribute(olexem.args[0]);
			$tag.setAttribute(lexem.args[0], lexem.args[1]);
		} else if (lexem.args[1] !== olexem.args[1])
			$tag.setAttribute(lexem.args[0], lexem.args[1]);
	},

	prop($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0]) {
			delete $tag[olexem.args[0]];
			$tag[lexem.args[0]] = lexem.args[1];
		} else if (lexem.args[1] !== $tag[lexem.args[0]] /*olexem.args[1]*/ ) // look diectly in element : for "checked" bug (or other properties that change on native interaction with element)
			$tag[lexem.args[0]] = lexem.args[1];
	},

	data($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0]) {
			delete $tag.dataset[olexem.args[0]];
			$tag.dataset[lexem.args[0]] = lexem.args[1];
		} else if (lexem.args[1] !== olexem.args[1])
			$tag.dataset[lexem.args[0]] = lexem.args[1];
	},

	style($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0]) {
			delete $tag.style[olexem.args[0]];
			$tag.style[lexem.args[0]] = lexem.args[1];
		} else if (lexem.args[1] !== olexem.args[1])
			$tag.style[lexem.args[0]] = lexem.args[1];
	},

	id($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0])
			$tag.id = lexem.args[0];
	},

	on($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0] || lexem.args[1] !== olexem.args[1]) {
			$tag.removeEventListener(olexem.args[0], olexem.args[1]);
			$tag.addEventListener(lexem.args[0], lexem.args[1]);
		}
	},

	onDom($tag, lexem, olexem /* args = render, dif, remove */ ) {
		const dif = lexem.args[1];
		if (dif)
			dif($tag, lexem, olexem);
	},

	html($tag, lexem, olexem) {
		if (olexem.args[0] !== lexem.args[0]) {
			const lastChild = olexem.children ? olexem.children[olexem.children.length - 1] : null,
				nextSibling = lastChild ? lastChild.nextSibling : null;
			olexem.children && olexem.children.forEach((child) => {
				$tag.removeChild(child);
			});
			lexem.children = insertHTML(lexem.args[0], $tag, nextSibling);
		}
	}
};

function dif($tag, babelute, oldb, env) {
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
				action($tag, lexem, olexem, env);
			else if (argsChanged(lexem.args, olexem.args)) {
				// no action means compounds first degree lexem. so check args dif...
				lexem.developed = bbl.developOneLevel(lexem);
				dif($tag, lexem.developed, olexem.developed, env);
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
		$tag.removeEventListener(lexem.args[0], lexem.listener || lexem.args[1]);
	},
	each($tag, lexem, scopes) {
		lexem.children.forEach((child) => {
			remove($tag, child, scopes);
		});
	},
	onDom($tag, lexem /* render, dif, remove */ ) {
		const remove = lexem.args[2];
		if (remove)
			remove($tag, lexem);
	}
};

function remove($tag, babelute, env) {
	for (let i = 0, lexems = babelute._lexems, lexem, action, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (!_targets[lexem.lexicon])
			continue;
		action = removeActions[lexem.name];
		if (action) // class, attr, id, prop, data, each, and .on
			action($tag, lexem, env);
		else if (lexem.developed) { // compounds and if
			remove($tag, lexem.developed, env);
			lexem.developed = null;
		} else if (lexem.child) { // tag and text
			$tag.removeChild(lexem.child);
			lexem.child = null;
		}
		if (lexem.witness) // view, if, each
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
	$output($tag, babelute, oldBabelute, env) {
		env = env || new Scopes(this._initScopes ? this._initScopes() : null);
		oldBabelute ? dif($tag, babelute, oldBabelute, env) : render($tag, babelute, env);
		return babelute;
	},
	render,
	dif,
	remove,
	renderActions,
	difActions,
	removeActions
});

export default difPragmas;
