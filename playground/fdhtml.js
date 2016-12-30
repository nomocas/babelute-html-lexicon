Babelute = require('../lib/babelute');
require('../lib/lexicons');
require('../languages/html');
Babelute.extendLexic('html', 'fdhtml');
var h = Babelute.firstDegreeInitializer('fdhtml');

Babelute.toLexic('fdhtml', {
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
		return this.each(collection, function(item) {
			return h.h1(item.title)
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
				h.class('testclass'), label || 'whaaaaaaa'
			)
			.div('bouh')
	},
	myOtherCompound: function(test) {
		return this
			.hr()
			.if(test,
				h
				.class('blam')
				.div('rooooo')
				.h3('bloupi')
				.div(
					test,
					h.span('-foo')
				)
				.h1('rolipop'),
				h.div('elseeeee')
			)
			.hr()
			.div('rooo')
			.myCompound(test)
			.myCompound()
	}
});

Babelute.toLexic('fdhtml', {
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
			.each(products, function(item) {
				return h.product(item);
			})
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

function render(state) {
	return h.div(state.title)
		.myCompound('flash')
		.div(state.body)
		.myOtherCompound(state.test)
		.myCompound('gloupolipou')
		.myView(state.product, state.collec)
}

//___________________________________________

var diffd = require('../babelute-html/html-dif-first-degree'),
	$root = document.getElementById('root'),
	$singleDifTest = document.getElementById('single-dif-test-button'),
	$difTest = document.getElementById('test-dif-button');


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

var productsNumbers = [10, 20, 30, 20, 10, 30, 0, 30, 15, 15],
	countProducts = 0,
	products = getProducts(30);

var babelute;
var ok = true;
window.rerender = function() {
	babelute = render({
		title: 'flupi',
		body: 'baaaaahhhhh',
		test: (ok = !ok),
		product: {
			title: 'prod title',
			body: 'prod body'
		},
		collec: products //getProducts(productsNumbers[countProducts++ % productsNumbers.length])
	}).$htmlFirstDegree($root, babelute);
}


function render2() {
	return h
		.text('bloupiiii')
		.div(h.span('hiii'))
		.filterableProductsTable(getProducts(100))
		.div('yeeeeeehaaaaa');
}

var maxTest = 200,
	testDelay = 15;

window.runTest = function() {
	$root.innerHTML = '';
	babelute = null;
	var count = 0,
		totalTime = 0,
		interval = setInterval(function() {
			var time = new Date().valueOf();
			window.rerender();
			time = new Date().valueOf() - time;
			totalTime += time;
			if (++count === maxTest) {
				console.log('dif FD %sx : %s - %s', maxTest, totalTime, totalTime / maxTest)
				clearInterval(interval);
			}
		}, testDelay);
};

window.runTest2 = function() {
	$root.innerHTML = '';
	babelute = null;
	var time = new Date().valueOf();
	for (var i = 0; i < maxTest; ++i)
		window.rerender();
	time = new Date().valueOf() - time;
	console.log('dif FD bulk %sx : %s - %s', maxTest, time, time / maxTest)
};

$difTest.addEventListener('click', function() {
	window.runTest();
});

var ntDif;
$singleDifTest.addEventListener('click', function() {
	var time = new Date().valueOf();
	window.rerender();
	time = new Date().valueOf() - time;
	console.log('single dif FD test', time)
});