/**
 * ****** FirstLevel AST diffing ******
 * 
 * World's Fastest Diffing algorithm (in many cases ;)).
 * Also one of the lightest and simplest to understand, tweak, maintain, etc.
 *
 * No more esoteric Virtual DOM or diffing algorithm.
 *
 * The only abstract part to understand is the FirstLevel Babelute concept (which is simple by nature. don't panic ;))
 * and the related oneLevelDeveloppement method.
 *
 *
 * First Level refer to "first level of understanding", as if every words are understoud only "literally".
 * 
 * In french there is an expression for this concept which seems to not exists as this in english 
 * and which could be translated literally as "understanding (or expressing) things at first degree", "... second degree", "... third degree", ..., "{x} degree".
 *
 * We could talk about "second degree humour", 
 * or say about someone that he "takes everything at first degree" (he never understands things deeply or has no sens of humour), 
 * or say about a text that it contains multiple "degree of understanding".
 *
 * As "first degree" in english is understoud as "the more serious" or "the more important", 
 * and as in french it says "the less understoud" or "the more literal" or "the most obvious",
 * I prefer use "FirstLevel" to make things clear.
 * 
 * A FirstLevel Babelute is a Babelute (a DSL's lexicon) where all "compounds lexems methods" are replaced by the "default atom method" 
 * (aka a method that just append a single lexem with its name as lexem's name and that provide its arguments as lexem's args).
 * So a FirstLevel api signature is exactly the same than it's correspondant Babelute, but every lexem are seen as a syntactical atoms.
 *
 * (see Babelute documentation for more details).
 *
 * One other important things to understand is that it need a "stable AST", which means that diffed sentences should be the "same" between each rendering (same lexems structure).
 *
 * So, you MUST use .if(condition, babelute, elseBabelute) and .each(array, function(item, index){ return ...a babelute...; }) 
 * to forge conditionaly or repeatedly sentences.
 *
 * In other words : do not write :
 *
 * var myBabelute = h.myLexem(...);
 * if(blabla)
 * 		myBabelute.myOtherLexem(...);
 * 	else
 * 		myBabelute.myThirdLexem(...);
 *  myCollection.forEach(function(item){
 *  	myBabelute.myFourthLexem(item.title);
 *  });
 *  
 * Which will produce different sentences structures depending on inputs (lexems and arguments are differents).
 * But in place write :
 *
 * h.myLexem(...)
 * .if(blabla, h.myOtherLexem(...), h.myThirdLexem(...))
 * .each(myCollection, function(item){
 * 		return h.myFourthLexem(item.title);
 * });
 *
 * Which will produce the same lexems structure, regardless of the inputs (only arguments change). 
 *
 *
 * Algorithmic details
 *
 * Good algorithmic optimisations works by cutting logical tree as high as possible.
 * This one works on the highest avaiable tree : the template's AST.
 * It works by diffing components arguments (dsl's method - aka lexem's - arguments) and by developping lexems "degree by degree", only when needed.
 * It allows to keep rendering perf incredibly stable through sequence of modifications and quite independent of DOM nodes quantity.
 * More you have components, more you have nodes, better optimisations you have.
 *
 * Algorithmic performance always depends on inputs set. And this one either.
 * As it constructs and hold the whole template AST at first rendering (the lightest one) 
 * in addition to leafs (HTML DSL Atoms - Seen as ours Virtual DOM nodes) and DOM's elements, 
 * first rendering is a (really) little bit more consuming than other cutting-edge diffing algorithm 
 * that produce only DOM's elements (mythril, vue, plastik, ... -  see benchmark).
 * 
 * But this one is much faster after, simply because it rerender and dif only few paths in AST 
 * in place of rerendering and diffing big bunchs of (Virtual)DOM's elements.
 *
 * The complexity depends on AST mean path length from root to leaf.
 *
 * One thing fun is that it works as a simple classical diffing algorithm (aka. always rerender all and dif resulted virtual dom) 
 * when not used with FirstLevel babelutes (so when used with "normal" babelutes). 
 * And so the fondamental difference between this algorithm and the classic one is just few lines.
 *
 * 
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */

// import { Lexem } from 'babelute/lib/babelute';
import htmlLexicon from '../html-lexicon';
import Pragmatics from 'babelute/src/pragmatics/pragmatics-core';
import HTMLScopes from './html-scopes.js';
import domUtils from './dom-utils'; // only used in contentEditable. safe for server and string output usage.

const h = htmlLexicon.Atomic.initializer, // only needed for .text() in tag's children
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

	if($tag, lexem, env, frag) {
		const toRender = lexem.args[0] ? lexem.args[1] : (lexem.args[2] ? lexem.args[2] : null);
		if (toRender) {
			lexem.developped = (typeof toRender === 'function') ? toRender() : toRender;
			render($tag, lexem.developped, env, frag);
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
		lexem.children = domUtils.insertHTML(lexem.args[0], $tag);
	}
};

function render($tag, babelute, env, frag) {
	for (let i = 0, action, lexem, lexems = babelute._lexems, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (!_targets[lexem.lexic])
			continue;
		action = renderActions[lexem.name];
		if (action)
			action($tag, lexem, env, frag);
		else // no actions means it's a compound lexem : so recursion on first degree dev.
			render($tag, htmlLexicon.developOneLevel(lexem), env, frag);
	}
}

//______________________________________________ DIF STRATEGY

const difActions = {
	// structurals
	if($tag, lexem, olexem, env) {
		lexem.witness = olexem.witness;
		const args = lexem.args,
			oargs = olexem.args;
		let toRender;
		if (!args[0] !== !oargs[0]) { // condition has change
			if (!args[0] || oargs[2]) // if condition was true (there is a success babelute that was rendered) OR it was false and there is an elseBabelute in olexem that was rendered
				remove($tag, olexem.developped, env); // remove old babelute (either "success or else" babelute)
			toRender = args[0] ? args[1] : args[2]; // if condition is true take "success babelute", else take "else babelute"
			if (toRender) { // render : add children tags to fragment then add to $tag + add attributes (and co) directly to $tag.
				const frag = document.createDocumentFragment();
				lexem.developped = (typeof toRender === 'function') ? toRender() : toRender;
				render($tag, lexem.developped, env, frag);
				$tag.insertBefore(frag, lexem.witness);
			}
		} else { // no change so dif rendered babelutes
			toRender = args[0] ? args[1] : args[2];
			if (toRender) {
				lexem.developped = (typeof toRender === 'function') ? toRender() : toRender;
				dif($tag, lexem.developped, olexem.developped, env);
			}
		}
	},

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
			lexem.children = domUtils.insertHTML(lexem.args[0], $tag, nextSibling);
		}
	}
};

function dif($tag, babelute, oldb, env) {
	for (let lexem, olexem, action, i = 0, len = babelute._lexems.length; i < len; ++i) {
		lexem = babelute._lexems[i];
		if (!_targets[lexem.lexic])
			continue;
		olexem = oldb._lexems[i];
		if (!lexem.args.length) // wathever lexem is : no args implies never change, so keep old rendered
			lexem.developped = olexem.developped;
		else {
			action = difActions[lexem.name]; // structural or atom diffing action
			if (action) // let strategy action do the job
				action($tag, lexem, olexem, env);
			else if (argsChanged(lexem.args, olexem.args)) // no action means compounds first degree lexem. so check args dif...
				dif($tag, htmlLexicon.developOneLevel(lexem), olexem.developped, env);
			else // keep old rendered (compounds args haven't changed : so nothing to do)
				lexem.developped = olexem.developped;
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
		if (!_targets[lexem.lexic])
			continue;
		action = removeActions[lexem.name];
		if (action) // class, attr, id, prop, data, each, and .on
			action($tag, lexem, env);
		else if (lexem.developped) { // compounds and if
			remove($tag, lexem.developped, env);
			lexem.developped = null;
		} else if (lexem.child) { // tag and text
			$tag.removeChild(lexem.child);
			lexem.child = null;
		}
		if (lexem.witness) // view, if, each
			$tag.removeChild(lexem.witness);
	}
}

//______________________________________________

// exports pragmatics Object
export default new Pragmatics(_targets, {
	$output($tag, babelute, oldBabelute, env) {
		env = env || new HTMLScopes();
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

/********************
 * Small First degree optimisation for diffing (bypass inner degrees developement) (don't look if you're new with babelute ;))
 * Optional.
 *********************/
// small first degree optimisation (bypass .tag(._append()))
// htmlLexicon.tagsList.forEach((name) => {
// 	htmlLexicon.FirstLevel.prototype[name] = function() {
// 		this._lexems.push(new Lexem('html', 'tag', [name, arguments]));
// 		return this;
// 	};
// });
// // small first degree optimisation (bypass .on(._append()))
// htmlLexicon.eventsList.forEach((eventName) => {
// 	htmlLexicon.FirstLevel.prototype[eventName] = function(handler, argument) {
// 		this._lexems.push(new Lexem('html', 'on', [eventName, handler, argument]));
// 		return this;
// 	};
// });
