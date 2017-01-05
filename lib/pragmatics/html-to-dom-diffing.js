/**
 * ****** First Degree AST diffing ******
 * 
 * World's Fastest Diffing algorithm.
 * Also really light and simple to understand, tweak, maintain, etc.
 *
 * The only abstract part to understand is the First Degree concept which is simple by nature.
 * (see Babelute documentation for more details) 
 * 
 * 
 * Good algorithmic optimisations works by cutting logical tree as high as possible.
 * This one works on the highest avaiable tree : the template's AST.
 * It works by developping and diffing components "degree by degree", only when needed.
 * It allows to keep rendering perf incredibly stable through sequence of modifications and quite independant of DOM nodes quantity.
 * More you have components, more you have nodes, better optimisations you have.
 *
 * Algorithmic performance always depends on inputs set. And this one either.
 * As it constructs and hold the whole template AST at first rendering (the lightest possible) in addition to DOM's elements, 
 * first rendering is a little bit less performant than other cutting-edge diffing algorithm (mythril, vue, plastik, ... -  see benchmark) 
 * that produce only DOM's elements.
 * But this one is MUCH faster after, simply because it rerender and dif only few paths in AST 
 * in place of rerendering and diffing big bunchs of (Virtual)DOM's elements.
 *
 * It's the power of babelute's introspection coupled with Babelute's first-degree concept.
 * 
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */

require('../html');
var Babelute = require('babelute/lib/babelute'),
	h = Babelute.initializer('html'), // only needed for .text() in tag's children
	_targetLexics = {
		default: true,
		html: true
	};

//______________________________________________ RENDER STRATEGY

var renderActions = {
	// Atoms rendering
	class: function($tag, lexem) {
		var args = lexem.args; /* className */
		if (args[0] && (args.length === 1 || args[1]))
			$tag.classList.add(args[0]);
	},
	attr: function($tag, lexem) {
		var args = lexem.args; /* name, value */
		$tag.setAttribute(args[0], args[1]);
	},
	prop: function($tag, lexem) {
		var args = lexem.args; /* name, value */
		$tag[args[0]] = args[1];
	},
	data: function($tag, lexem) {
		var args = lexem.args; /* name, value */
		$tag.dataSet[args[0]] = args[1];
	},
	id: function($tag, lexem) {
		var args = lexem.args; /* value */
		$tag.id = args[0];
	},
	on: function($tag, lexem) {
		var args = lexem.args; /* eventName, callback */
		$tag.addEventListener(args[0], args[1]);
	},

	// structural render actions
	tag: function($tag, lexem, env, frag) {
		lexem.child = document.createElement(lexem.args[0]);
		(frag || $tag).appendChild(lexem.child);
		var babelutes = lexem.args[1],
			babelute;
		for (var i = 0, len = babelutes.length; i < len; ++i) {
			babelute = babelutes[i];
			if (typeof babelute === 'undefined') // cast undefined to '' to keep track of node for diffing
				babelute = '';
			if (!babelute || !babelute.__babelute__) // text node
				babelute = babelutes[i] = h.text(babelute);
			render(lexem.child, babelute, env);
		}
	},

	text: function($tag, lexem, env, frag) {
		lexem.child = document.createTextNode(lexem.args[0]);
		(frag || $tag).appendChild(lexem.child);
	},

	if: function($tag, lexem, env, frag) {
		var toRender = lexem.args[0] ? lexem.args[1] : (lexem.args[2] ? lexem.args[2] : null);
		if (toRender) {
			render($tag, toRender, env, frag);
			lexem.developped = toRender;
		}
		lexem.witness = document.createComment('if');
		$tag.appendChild(lexem.witness);
	},

	each: function($tag, lexem, env, frag) {
		var args = lexem.args;
		lexem.children = [];
		var collection = args[0] = args[0] ||  [],
			itemRender = args[1],
			item;
		for (var i = 0, len = collection.length; i < len; ++i) {
			var rendered = itemRender(collection[i]);
			lexem.children.push(rendered);
			render($tag, rendered, env, frag);
		}
		lexem.witness = document.createComment('each');
		$tag.appendChild(lexem.witness);
	},

	// custom output
	onDom: function($tag, lexem, env, frag /* args = render, dif, remove */ ) {
		var onRender = lexem.args[0];
		if (onRender)
			onRender($tag, lexem, env, frag);
	},
	onString: function(descriptor, lexem, env /* render */ ) {
		var onRender = lexem.args[0];
		if (onRender)
			onRender(descriptor, lexem, env);
	}
};

function render($tag, babelute, env, frag) {
	for (var i = 0, action, lexem, lexems = babelute._lexems, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (!_targetLexics[lexem.lexic])
			continue;
		action = renderActions[lexem.name];
		if (action)
			action($tag, lexem, env, frag);
		else // no actions means it's a compound lexem : so recursion on first degree dev.
			render($tag, Babelute.expandOneDegreeLexem(lexem), env, frag);
	}
}

//______________________________________________ DIF STRATEGY

var difActions = {
	// structurals
	if: function($tag, lexem, olexem, env) {
		lexem.witness = olexem.witness;
		var args = lexem.args,
			oargs = olexem.args,
			toRender;
		if (!args[0] !== !oargs[0]) { // condition has change
			if (args[0]) { // new condition is true
				if (oargs[2]) // has old rendered "else" : remove it
					remove($tag, oargs[2], env);
				toRender = args[1]; // render "success" babelute
			} else { // new condition is false
				remove($tag, oargs[1], env); // remove "success" babelute
				toRender = args[2]; // try render "else" babelute
			}
			if (toRender) {
				var frag = document.createDocumentFragment();
				lexem.developped = toRender;
				render($tag, toRender, env, frag);
				$tag.insertBefore(frag, lexem.witness);
			}
		} else if (args[0]) { // no change and condition is true
			lexem.developped = args[1];
			dif($tag, args[1], oargs[1], env);
		} else if (args[2]) { // no change and condition is false and there is a "else" babelute to render (third argument of .if call)
			lexem.developped = args[2];
			dif($tag, args[2], oargs[2], env);
		}
	},

	each: function($tag, lexem, olexem, env) {
		var collection = lexem.args[0],
			renderItem = lexem.args[1],
			ochildren = olexem.children,
			len = collection.length,
			olen = ochildren.length,
			children = lexem.children = [],
			rendered,
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

	tag: function($tag, lexem, olexem, env) {
		lexem.child = olexem.child; // keep track of elementNode
		var babelutes = lexem.args[1],
			obabelutes = olexem.args[1],
			babelute, obabelute;
		for (var i = 0, len = babelutes.length; i < len; i++) {
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

	text: function($tag, lexem, olexem) {
		lexem.child = olexem.child; // keep track of textnode
		if (lexem.args[0] !== olexem.args[0])
			lexem.child.nodeValue = lexem.args[0];
	},

	// html simple atoms diffing
	class: function($tag, lexem, olexem) {
		var name = lexem.args[0], // new class name
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

	attr: function($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0]) {
			$tag.removeAttribute(olexem.args[0]);
			$tag.setAttribute(lexem.args[0], lexem.args[1]);
		} else if (lexem.args[1] !== olexem.args[1])
			$tag.setAttribute(lexem.args[0], lexem.args[1]);
	},

	prop: function($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0]) {
			delete $tag[olexem.args[0]];
			$tag[lexem.args[0]] = lexem.args[1];
		} else if (lexem.args[1] !== $tag[lexem.args[0]] /*olexem.args[1]*/ ) // look diectly in element : for "checked" bug (or other properties that change on native interaction with element)
			$tag[lexem.args[0]] = lexem.args[1];
	},

	data: function($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0]) {
			delete $tag.dataSet[olexem.args[0]];
			$tag.dataSet[lexem.args[0]] = lexem.args[1];
		} else if (lexem.args[1] !== olexem.args[1])
			$tag.dataSet[lexem.args[0]] = lexem.args[1];
	},

	id: function($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0])
			$tag.id = lexem.args[0];
	},

	on: function($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0] || lexem.args[1] !== olexem.args[1]) {
			$tag.removeEventListener(olexem.args[0], olexem.args[1]);
			$tag.addEventListener(lexem.args[0], lexem.args[1]);
		}
	},

	onDom: function($tag, lexem, olexem /* args = render, dif, remove */ ) {
		var dif = lexem.args[1];
		if (dif)
			dif($tag, lexem, olexem);
	}
};

function dif($tag, babelute, oldb, env) {
	for (var lexem, olexem, action, i = 0, len = babelute._lexems.length; i < len; ++i) {
		lexem = babelute._lexems[i];
		if (!_targetLexics[lexem.lexic])
			continue;
		olexem = oldb._lexems[i];
		if (!lexem.args.length) // wathever lexem is : no args implies never change, so keep old rendered
			lexem.developped = olexem.developped;
		else {
			action = difActions[lexem.name]; // structural or atom diffing action
			if (action) // let strategy action do the job
				action($tag, lexem, olexem, env);
			else if (argsChanged(lexem.args, olexem.args, env)) // no action means compounds first degree lexem. so check args dif...
				dif($tag, Babelute.expandOneDegreeLexem(lexem), olexem.developped, env);
			else // keep old rendered (compounds args haven't changed : so nothing to do)
				lexem.developped = olexem.developped;
		}
	}
}

function argsChanged(args, oargs, env) {
	for (var i = 0, len = args.length; i < len; ++i)
		if (args[i] !== oargs[i]) // simple reference check : need immutables
			return true;
	return false;
}

//______________________________________________ REMOVE STRATEGY

var removeActions = {
	attr: function($tag, lexem) {
		$tag.removeAttribute(lexem.args[0]);
	},
	class: function($tag, lexem) {
		if (lexem.args[0])
			$tag.classList.remove(lexem.args[0]);
	},
	prop: function($tag, lexem) {
		delete $tag[lexem.args[0]];
	},
	data: function($tag, lexem) {
		delete $tag.dataSet[lexem.args[0]];
	},
	id: function($tag, lexem) {
		delete $tag.id;
	},
	on: function($tag, lexem) {
		$tag.removeEventListener(lexem.args[0], lexem.listener || lexem.args[1]);
	},
	each: function($tag, lexem) {
		lexem.children.forEach(function(child) {
			remove($tag, child, env);
		});
	},
	onDom: function($tag, lexem /* render, dif, remove */ ) {
		var remove = lexem.args[2];
		if (remove)
			remove($tag, lexem);
	}
};

function remove($tag, babelute, env) {
	for (var i = 0, lexems = babelute._lexems, lexem, action, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (!_targetLexics[lexem.lexic])
			continue;
		if (action = removeActions[lexem.name]) // class, attr, id, prop, data, each, and .on
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

// exports babelute-pragmatics Object
module.exports = {
	_targetLexics: _targetLexics,
	$output: function($tag, babelute, oldBabelute, env) {
		oldBabelute ? dif($tag, babelute, oldBabelute, env) : render($tag, babelute, env);
		return babelute;
	},
	render: render,
	dif: dif,
	remove: remove,
	strategies: {
		render: renderActions,
		dif: difActions,
		remove: removeActions
	}
};



// Alternative (more optimised method for diffing tags and compounds wit babelutes as argument(s) and no change on others)
//
// if there is no change on non-babelutes arguments (or there is no non-babelutes arguments) : 
// we could  directly compare babelutes arguments without executing current lexem developpement.
// If there is some non-babelutes arguments changes : 
// we need to develop current lexem with included non-babelutes aguments as normal.
// (they will be compared through developpement)
/*

	ya moyen de difer juste les babelutes sans récursion : 

		fairecomme avant diff sur args avec catch babelute et shouldExpand

		if(! shouldExpend && babeluteS.length)
			==> Babelute.developOneDegree(lexem)
			==> dif (bi and obi)

 */
/*
don't forget :  babelute.parent = lexem.child;   (on tag's children babelute)

 function difArgs2($tag, args, oargs, env) {
	var shouldExpand = false, // say if we have seen changes between non-babelutes arguments
		babelutes = [];
	for (var i = 0, arg, len = args.length; i < len; ++i) {
		arg = args[i];
		if (arg && arg.__babelute__)
			babelutes.push({
				b: arg,
				ob: oargs[i]
			});
		else if (arg !== oargs[i]) { // simple reference check : need immutables
			shouldExpand = true;
			break;
		}
	}
	if (!shouldExpand && babelutes.length)
		for (var j = 0, lenj = babelutes.length, b, oldb; j < lenj; ++j) {
			b = babelutes[j].b;
			oldb = babelutes[j].ob;
			b.parent = oldb.parent;
			dif(oldb.parent ||  $tag, b, oldb, env);
			oldb._lexems = b._lexems;
		}
	return shouldExpand;
}*/