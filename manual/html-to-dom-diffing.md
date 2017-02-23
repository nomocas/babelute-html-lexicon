# AST html diffing

__One of the World's Fastest Diffing algorithms__. Also one of the lightest and simplest to understand, tweak, maintain, etc.

No more esoteric Virtual DOM or diffing algorithm. 

For benchmark : see [todomvc bench](https://github.com/nomocas/babelute-todomvc-bench).

## Usage

```javascript

//__________________ def a store (aka your model)
// (something that handle immutable data and could trigger, somehow, an event when data are updated (use Redux and Immutables by example))
// here we'll define a singleton minimalistic EventEmitter based store

import EventEmitter from 'event-emitter-es6';

const MyEmitterStore = new EventEmitter(),
	proto = {
		route: 'all',
		myCollection:[1,2,3]
		ID: 0,
		methods: {
			addItem(title) {
				// all methods need to produce/handle data as immutable
				this.myCollection = this.myCollection.concat({
					title: title || '',
					id: this.ID++
				});
				this.emit('update', this);
			},
			//...
		}
	};

// copy proto
for (const i in proto)
	MyEmitterStore[i] = proto[i];

// bind all methods to root
for (const i in MyEmitterStore.methods)
	MyEmitterStore.methods[i] = MyEmitterStore.methods[i].bind(MyEmitterStore);


//__________________ create your lexicon (aka the components of your view(s))

import babelute from 'babelute';
import htmlLexicon from 'babelute-html/src/html-lexicon';

const myLexicon = babelute.createLexicon('myLexiconName', htmlLexicon);

myLexicon.addCompounds((h) => {
	return {
		// main entry point
		myEntryPointLexem(myCollection, route, methods) {
			return this.section(
				h.class('my-component')
				.myHeader(datas, methods)
				.div(
					h.class('my-container').visible(data.length)
					.button('add item', h.on('click', () => methods.addItem('myTitle') ))
					.ul(
						h.class('item-list')
						.each(myCollection, (item) => {
							return h.myItem(item, methods);
						})
					)
				)
			);
		},
		//...
	}
});

//__________________________ Use your lexicon with your store through diffing

import differ from 'babelute-html/src/pragmatics/html-to-dom-diffing'; // first degree diffing (only for DOM)

// don't forget to add your lexicon(s) to differ's targets
differ.addLexicon(myLexicon);	

const h = myLexicon.firstLevelInitializer,
	$root = document.getElementById('my-app'); // where rendering take place

// -------- render ----------

let oldRendered, // for diffing tracking
	animFrame;

// bind store update to main render
MyEmitterStore.on('update', (state) => {
	if (animFrame)
		cancelAnimationFrame(animFrame);
	animFrame = requestAnimationFrame(() => {
		const rendered = h.myEntryPointLexem(state.myCollection, state.route, state.methods); // rerender on store update
		oldRendered = differ.$output($root, rendered, oldRendered);
	});
});

// -------- routes ----------

// simple hashchange binding for routing
function hashChange() {
	MyEmitterStore.route = window.location.hash.substring(2) || 'all';
	MyEmitterStore.emit('update', MyEmitterStore);
}
window.onhashchange = hashChange;

hashChange(); // set current route and launch

```

see [todomvc example](https://github.com/nomocas/babelute-html-todomvc).

## FirstLevel AST

Behind the hood, it's only based on lazzy AST traversing and developement, and arguments diffing (by strict equality - aka reference check), which is useful to understand for many other cases, and gives you all the science to 
	- understand when and how optimize things in your app
	- how tweaking engine or developping "plugins" that works with it

The only abstract part to understand is the FirstLevel Babelute concept (which is simple by nature. don't panic ;))
and the related developOneLevel method.

First Level refer to "first level of understanding", as if every words are understoud only "literally".

In french there is an expression for this concept which seems to not exists as this in english... and which could be translated literally as "understanding (or expressing) things at first degree", "... second degree", "... third degree", ..., "{x} degree".

We could talk about "second degree humour", 
or say about someone that he "takes everything at first degree" (he never understands things deeply or has no sens of humour), 
or say about a text that it contains multiple "degree of understanding".

As "first degree" in english is understoud as "the more serious" or "the more important", and as in french it says "the less understoud" or "the more literal" or "the most obvious", I prefer use "FirstLevel" to make things clear.

A FirstLevel Babelute is a Babelute (a DSL's lexicon) where all "compounds lexems methods" are replaced by the "default atom method" 
(aka a method that just append a single lexem with its name as lexem's name and that provide its arguments as lexem's args).
So a FirstLevel api signature is exactly the same than it's correspondant "Atomic" Babelute, but every lexem are seen as a syntactical atoms.

(see Babelute documentation for more details).

## AST stabilisation

One other important things to understand is that it needs a "stable AST", which means that diffed sentences should be the "same" between each rendering (same lexems structure).

So, you MUST use .if(condition, babelute, elseBabelute) and .each(array, function(item, index){ return ...a babelute...; }) 
to forge conditionaly or repeatedly sentences.

In other words : do not write :
```javascript
var myBabelute = h.myLexem(...);
if(blabla)
		myBabelute.myOtherLexem(...);
	else
		myBabelute.myThirdLexem(...);
myCollection.forEach(function(item){
	myBabelute.myFourthLexem(item.title);
});
```
Which will produce different sentences structures depending on inputs (lexems and arguments are differents).
But in place write :
```javascript
h.myLexem(...)
.if(blabla, h.myOtherLexem(...), h.myThirdLexem(...))
.each(myCollection, function(item){
		return h.myFourthLexem(item.title);
});
```
Which will produce, on each execution, the same lexems structure, regardless of the inputs (only arguments change). It simplify

## Algorithmic details

Good algorithmic optimisations works by cutting logical tree as high as possible. This one works on the highest avaiable tree : the template's AST.

It works by diffing components arguments (dsl's method - aka lexem's - arguments) and by developping lexems "degree by degree", only when needed.
It allows to keep rendering perf incredibly stable through sequence of modifications and quite independent of DOM nodes quantity.
More you have components, more you have AST-nodes, better optimisations you have.

Algorithmic performance always depends on inputs set. And this one either. As it constructs and hold the whole template AST at first rendering (the lightest one) 
in addition to leafs (HTML DSL Atoms - Seen as ours Virtual DOM nodes) and DOM's elements, 
first rendering is a (really) little bit more consuming than other cutting-edge diffing algorithm 
that produce only DOM's elements (mythril, vue, plastik, ... -  see benchmark).

But this one is much faster after, simply because it rerenders and difs only few paths in AST in place of rerendering and diffing big bunchs of (Virtual)DOM's elements.

The complexity depends on AST mean path length from root to leaf.

One thing fun is that it works as a simple classical diffing algorithm (aka. always rerender all and dif resulted virtual dom (i.e. the leafs)) 
when not used with FirstLevel babelutes (so when used with "Atomic" babelutes). 
And so the fondamental difference between this algorithm and the classic one is just few lines.

