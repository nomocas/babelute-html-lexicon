# babelute-html

HTML DSL for Babelute. So simple, so powerful.

- __One of the lightest__ modern pure js html lib avaiable (around 4Ko gzipped with dependencies) 
- Natural Web Components definition and usage.
- Natural and clean React-like one-way data-binding (or no-binding-at-all)
- Natural and easy DSL encapsulation/extension.
- __One of the fastest DOM diffing engine__ (fastest than Mithril in chrome and firefox - around 10 times faster than React)
- Simple and easy to understand algorithm. No more esoteric interpretation or optimisation trick. You are the master.
- Diffing algo that will show excellent behaviour when scalling. More components you have, more optimisation happend.
- Absolutly non-obstrusive (but need immutables). Play really well with other libs (redux, immutables, jquery, ...).
- Perfectly isomorphic. 
- Ultra fast server side string rendering.

And of course as a Babelute DSL, it could be used along with ALL other Babelute's DSL. 
Specifically, it will be used heavily as HTML translation target for any Babelute sentences that need HTML representation.
(By example : babelute-doc, babelute-aright, babelute-fs, babelute-cooking, ...)

It provides :
- the HTML5 keywords lexicon
- the HTML5 meta-tags (and social medias add-ons) lexicon
- 4 babelute's $output engines
	- html-to-string
	- html-to-dom
	- html-to-dom-diffing
	- html-two-pass-string (for real isomorphism)


It could be extended for any other rendering engine. By example there is already babelute-deathmood or babelute-vdom.

What is really elegant, is that none of the concepts or the tools needed to achieve this has been made for html handling. All this comes directly from Babelute DSL paradigm and is in fact just its application (one among all other DSLs).

## Licence

The [MIT](http://opensource.org/licenses/MIT) License

Copyright 2016-2017 (c) Gilles Coomans <gilles.coomans@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
