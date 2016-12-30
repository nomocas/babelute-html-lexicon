Babelute = require('../index');
require('../languages/html');
require('../babelute-html/html-view');
Babelute.extendLexic('html', 'myhtml');
var h = Babelute.initializer('myhtml');

/*

if products is a pecial collection that has .filter('...')
that hold filter results and associated query :
	it could prodvide same results if query don't change between call

on push, pop, shift and unshift : could hold a flag "hasChanged" AND applied modifications (whats where poped, pushed, etc) 
==> so a dedicated .each could see what's have been changed and could act optimally in consequence
 */

Babelute.toLexic('myhtml', {
	filterableProductsTable: function(products) {
		return this.view({
			filterProducts: function(filter) {
				return products.filter(function(prod) {
					return prod.title.indexOf(filter) > -1;
				});
			},
			getInitialState: function() {
				return {
					filter: ''
				};
			},
			updateFilter: function(e) {
				this.state.set({
					filter: e.target.value
				});
			},
			addProduct: function(e) {
				products.unshift({
					title: 'haaaiiu' + Math.random(),
					label: 'youhou'
				});
				this.state.render();
			},
			render: function(state) {
				// state.filter = Math.round(Math.random() * 10);
				return h.div(
					h.class('filterable-products-table')
					.searchBar(state.filter, this.updateFilter.bind(this))
					.productsTable(this.filterProducts(state.filter))
					.button('add one', h.click(this.addProduct.bind(this)))
				);
			}
		});
	},
	productsTable: function(products) {
		return this.div(
			h.class('products-table')
			._each(products, this.product)
		);
	},
	product: function(product) {
		return this.div(
			h.class('product-row')
			.div(h.strong(product.title))
			.div(product.label)
			.text('floupi doupi')
			.div('second text')
			.click(function(e) {
				console.log('heu')
			})
		);
	},
	searchBar: function(filter, updateFilter) {
		return this.div(
			h.class('search-bar')
			.textInput(filter,
				h.attr('placeHolder', 'search term')
				.on('input', updateFilter)
			)
		);
	}
});

/**
 * usage
 */

function render3() {
	var t = h.div('world' + Math.random(),
		h.attr('bloupi', 'foo')
		.div('hooooooo' + Math.random())
		.section('hello',
			h.div('hoooooojjjjjjo')
		)
	)
	for (var i = 0; i < 5; ++i)
		t.div('world' + Math.random(),
			h.attr('bloupi', 'foo')
			.div('hooooooo' /* + Math.random()*/ )
			.section('hello',
				h.attr('bloupi', 'foo').div('hoooooojjjjjjo')
			)
			.click(function(e) {
				console.log('heu')
			})
		);
	return t;
}

function getProducts(max) {
	var products = [];
	for (var i = 0; i < max; ++i)
		products.push({
			title: 'hoooo' + Math.random(),
			label: 'hissss'
		}, {
			title: 'haaa',
			label: 'huussss'
		}, {
			title: 'hiiio',
			label: 'heeessss'
		});
	return products;
}



function render2() {
	return h
		.text('bloupiiii')
		.div(h.span('hiii'))
		.filterableProductsTable(getProducts(100))
		.div('yeeeeeehaaaaa');
}

var t = render2();

function render() {
	return t;
}



Babelute.toLexic('myhtml', {
	myView: function(product, collec) {
		return this.view({
			updateLabel: function() {
				this.state.set('label', 'foooooo' + Math.random());
			},
			render: function(state) {
				return h.h1('product view')
					.div(product.title)
					.div(product.body)
					.h3(state.label || 'bam')
					.div('hiiii', h.click(this.updateLabel.bind(this)))
					.myCompound('floupi')
					.myCollec(collec)
					// .bunch()
					// .bunch()
					// .bunch()
			}
		})
	},
	myCollec: function(collection) {
		return this._each(collection, function(item) {
			return this.h1(item.title)
				.div(h.class('bouh'), item.label)
				.myOtherCompound('floupi')
				// .bunch();
		});
	},
	bunch: function() {
		return this.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
			.myOtherCompound('floupi')
	},
	myCompound: function(label) {
		return this.h1(
				h.class('testclass'), label || 'whaaa'
			)
			.div('bouh')
	},
	myOtherCompound: function(test) {
		return this
			.hr()
			// .if(test,
			// 	h
			// .class('blam')
			.div('rooooo')
			.h3('bloupi')
			.div(
				test,
				h.span('-foo')
			)
			.h1('rolipop')
			// 	,
			// 	h.div('elseeeee')
			// )
			.hr()
			.div('rooo')
			.myCompound(test)
			.myCompound()
	}
});


var ok = true;
var productsNumbers = [10, 20, 30, 20, 10, 30, 0, 30, 15, 15],
	countProducts = 0;

function render4() {
	var state = {
		title: 'flupi',
		body: 'baaaaahhhhh' + Math.random(),
		test: true, //(ok = !ok),
		product: {
			title: 'prod title' + Math.random(),
			body: 'prod body'
		},
		collec: getProducts(productsNumbers[countProducts++ % productsNumbers.length])
	};
	return h.div(state.title)
		.myCompound('flash')
		.div(state.body)
		.myOtherCompound(state.test)
		.myCompound('gloupolipou')
		.myView(state.product, state.collec)
}


/**
 * outputs
 */

require('../languages/actions/html-to-string');
require('../languages/actions/html-to-dom');
require('../babelute-html/html-to-vdom');
require('../babelute-html/html-to-deathmood');
require('../babelute-html/html-dif');

// console.log('j : %s', JSON.stringify(t))
// console.log('t : %s', t._stringify())
// console.log('r : %s', t.$htmlToString());

// 

function testJSON(max, render) {
	var time = new Date().valueOf();
	for (var i = 0; i < max; ++i) {
		JSON.stringify(render());
	}
	time = new Date().valueOf() - time;
	console.log('JSON : %s - %s', time, time / max);
}

function testStringify(max, render) {
	var time = new Date().valueOf();
	for (var i = 0; i < max; ++i) {
		render()._stringify();
	}
	time = new Date().valueOf() - time;
	console.log('Serialize : %s - %s', time, time / max);
}

function testString(max, render) {
	var time = new Date().valueOf();
	for (var i = 0; i < max; ++i) {
		render().$htmlToString();
	}
	time = new Date().valueOf() - time;
	console.log('html:string : %s - %s', time, time / max);
}

function testDom(max, render) {
	var time = new Date().valueOf();
	for (var i = 0; i < max; ++i) {
		$root.innerHTML = '';
		render().$htmlToDOM($root)
	}
	time = new Date().valueOf() - time;
	console.log('html:dom : %s - %s', time, time / max);
}

function testVdom(max, render) {
	$root.innerHTML = '';
	var time = new Date().valueOf(),
		nt;
	for (var i = 0; i < max; ++i) {
		nt = render().$htmlToVDOM($root, nt)
	}
	time = new Date().valueOf() - time;
	// console.log('html:vdom', time)
}

function testDeathmood(max, render) {
	$root.innerHTML = '';
	var time = new Date().valueOf(),
		nt;
	for (var i = 0; i < max; ++i) {
		nt = render().$htmlToDeathmood($root, nt);
	}
	time = new Date().valueOf() - time;
	console.log('html:deathmood : %s - %s', time, time / max);
	return nt;
}

function testDif(max, render) {
	$root.innerHTML = '';
	var time = new Date().valueOf(),
		nt;
	for (var i = 0; i < max; ++i) {
		nt = render().$htmlToDomDif($root, nt);
	}
	time = new Date().valueOf() - time;
	console.log('html:domdif : %s - %s', time, time / max);
	return nt;
}

function runAll(max, render) {
	console.log('________________ %sx', max);
	testJSON(max, render);
	testStringify(max, render);
	testString(max, render);
	testDeathmood(max, render); // 152, 148, 100 - 320, 800, 275 -   400, 1400, 426 ---   544, 2033, 618  --- 258, 337, 111
	testDom(max, render); // 178, 219, 161  -  496, 1001, 320 --  535, 1650, 476 - 587, 2127, 651  --- 684, 872, 166
	testDif(max, render);
	// testVdom(max, render);
}

var currentRender = render4;

var $root = document.getElementById('root'),
	$singleDOMTest = document.getElementById('single-dom-test-button'),
	$singleDeathMoodTest = document.getElementById('single-deathmood-test-button'),
	$singleDifTest = document.getElementById('single-dif-test-button'),
	$domTest = document.getElementById('test-dom-button'),
	$deathmoodTest = document.getElementById('test-deathmood-button'),
	$difTest = document.getElementById('test-dif-button'),
	$all = document.getElementById('test-all-button'),
	$clear = document.getElementById('clear-button');


var maxTest = 200,
	testDelay = 15;

$domTest.addEventListener('click', function() {
	$root.innerHTML = '';
	var count = 0,
		totalTime = 0,
		intervalID = setInterval(function() {
			var time = new Date().valueOf();
			$root.innerHTML = '';
			currentRender().$htmlToDOM($root);
			time = new Date().valueOf() - time;
			totalTime += time;
			count++;
			if (count === maxTest) {
				console.log('dom %sx : %s - %s', maxTest, totalTime, totalTime / maxTest)
				clearInterval(intervalID);
			}
		}, testDelay);
});
$deathmoodTest.addEventListener('click', function() {
	$root.innerHTML = '';
	var count = 0,
		totalTime = 0,
		nt,
		intervalID = setInterval(function() {
			var time = new Date().valueOf();
			nt = currentRender().$htmlToDeathmood($root, nt);
			time = new Date().valueOf() - time;
			totalTime += time;
			count++;
			if (count === maxTest) {
				console.log('deathmood %sx : %s - %s', maxTest, totalTime, totalTime / maxTest)
				clearInterval(intervalID);
			}
		}, testDelay);
});
$difTest.addEventListener('click', function() {
	$root.innerHTML = '';
	var count = 0,
		totalTime = 0,
		nt,
		intervalID = setInterval(function() {
			var time = new Date().valueOf();
			nt = currentRender().$htmlToDomDif($root, nt);
			time = new Date().valueOf() - time;
			totalTime += time;
			count++;
			if (count === maxTest) {
				console.log('dif %sx : %s - %s', maxTest, totalTime, totalTime / maxTest)
				clearInterval(intervalID);
			}
		}, testDelay);
});

$all.addEventListener('click', function() {
	$root.innerHTML = '';
	runAll(10, currentRender);
});

var nt;
$singleDeathMoodTest.addEventListener('click', function() {
	var time = new Date().valueOf();
	nt = currentRender().$htmlToDeathmood($root, nt);
	time = new Date().valueOf() - time;
	console.log('single deathmood test', time)
});

var ntDif;
$singleDifTest.addEventListener('click', function() {
	var time = new Date().valueOf();
	ntDif = currentRender().$htmlToDomDif($root, ntDif);
	time = new Date().valueOf() - time;
	console.log('single dif test', time)
});

$singleDOMTest.addEventListener('click', function() {
	var time = new Date().valueOf();
	$root.innerHTML = '';
	currentRender().$htmlToDOM($root)
	time = new Date().valueOf() - time;
	console.log('single dom test', time)
});

$clear.addEventListener('click', function() {
	$root.innerHTML = '';
	nt = null;
	ntDif = null;
});

// runAll(1, currentRender);

//