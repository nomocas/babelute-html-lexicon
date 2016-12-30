/**
 * Babelute Fondamental : all you need to do everything.
 * There is in fact two solutions to the question of the universe and everything else... : 42 and this. ;)
 *
 * Go learn Babelute and what to do with it, and come back later to fully appreciate why so much things, 
 * and even more, is derivated from this so simple and minimalistic lines of code. 
 */

// ES7 Style
class Babelute {
	_lexems = [];
	_append = (lexic, name, args) => {
		this._lexems.push({
			lexic: lexic,
			name: name,
			args: args
		});
		return this;
	}
}

function createInitializer(Class) {
	const initializer = {};
	for (var i in Class.prototype)
		initializer[i] = function() {
			var instance = new Class();
			return instance[i].call(instance, arguments);
		}
	return initializer;
}

class FirstDegree extends Babelute {}

function createFirstDegree(Class, lexicName) {
	class FDClass extends FirstDegree {};
	for (var i in Class.prototype)
		if (Class.prototype.hasOwnProperty(i))
			FDClass.prototype[i] = function() {
				return this._append(lexicName, i, arguments);
			};
	return FDClass;
}

//____________ HTML

class BabeluteHtml extends Babelute {}

['tag', 'attr', 'prop', 'data', 'class', 'id', 'text', 'on', 'if', 'each']
.forEach(function(atom) {
	BabeluteHtml.prototype[atom] = function() {
		return this._append('html', atom, arguments);
	};
})

['div', 'h1', 'h2', 'h3', 'section', 'span', 'button', 'article', 'hr', 'header', 'footer', 'label', 'ul', 'li', 'p', 'small', 'b', 'strong', 'i', 'u', 'select']
.forEach(function(tagName) {
	BabeluteHtml.prototype[tagName] = function() {
		return this._append('html', 'tag', [tagName, arguments]);
	};
});