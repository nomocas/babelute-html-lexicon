/**
 ************** HTML to DOM Actions ***********
 *
 *
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */

var Babelute = require('babelute/lib/babelute'),
	SimpleFacadePragmatics = require('babelute-pragmatics/lib/facade-pragmatics');

// we only need to provides language atoms implementations.
module.exports = Babelute.extendPragmatics(SimpleFacadePragmatics, {
	_targetLexics: {
		html: true
	},
	tag: function(node, args /* tagName, babelutes */ , env) {
		var child = document.createElement(args[0]);
		node.appendChild(child);
		var babelutes = args[1];
		for (var i = 0, len = babelutes.length; i < len; ++i) {
			var templ = babelutes[i];
			if (typeof templ === 'undefined')
				continue;
			if (templ && templ.__babelute__)
				this.$output(child, templ, env);
			else
				child.appendChild(document.createTextNode(templ)); // auto escaped when added to dom.
		}
	},
	text: function(node, args /* value */ ) {
		node.appendChild(document.createTextNode(args[0])); // auto escaped when added to dom.
	},
	class: function(node, args /* className, flag */ ) {
		if (args[0] && (args.length === 1 || args[1]))
			node.classList.add(args[0]);
	},
	attr: function(node, args /* name, value */ ) {
		node.setAttribute(args[0], args[1]);
	},
	prop: function(node, args /* name, value */ ) {
		node[args[0]] = args[1];
	},
	data: function(node, args /* name, value */ ) {
		node.dataSet[args[0]] = args[1];
	},
	id: function(node, args /* value */ ) {
		node.id = args[0];
	},
	on: function(node, args /* eventName, callback */ ) {
		node.addEventListener(args[0], args[1]);
	}
});