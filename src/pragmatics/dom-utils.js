/*
* @Author: Gilles Coomans
*/

export default {
	insertHTML(content, node, nextSibling) {
		if (!content)
			return;

		// TODO: use this in place : still to catch iserted elements and manage buggy text nodes (when html start with text node)
		// if(nextSibling)
		// 	nextSibling.insertAdjacentHTML('beforebegin', content);
		// else
		// 	node.insertAdjacentHTML('beforeend', content)

		const div = document.createElement('div'),
			elems = [];
		let wrapped;
		if (content[0] !== '<') { // to avoid bug of text node that disapear
			content = '<p>' + content + '</p>';
			wrapped = true;
		}
		div.innerHTML = content;
		const parent = wrapped ? div.firstChild : div,
			childNodes = [].slice.call(parent.childNodes);
		let frag;
		if (nextSibling)
			frag = document.createDocumentFragment();
		for (let i = 0, len = childNodes.length, el; i < len; ++i) {
			el = childNodes[i];
			elems.push(el);
			(frag || node).appendChild(el);
		}
		if (nextSibling)
			node.insertBefore(frag, nextSibling);
		return elems;
	},
	castNodeValueTo(node, type) {
		switch (type) {
			case 'text':
				return node.textContent;
			case 'integer':
				return parseInt(node.textContent, 10);
			case 'html':
				return node.innerHTML;
			default:
				throw new Error('content editable casting fail : unrecognised rule : ', type);
		}
	}
};
