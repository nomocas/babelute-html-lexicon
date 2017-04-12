# babelute-html-lexicon

[![Travis branch](https://img.shields.io/travis/nomocas/babelute-html-lexicon/master.svg)](https://travis-ci.org/nomocas/babelute-html-lexicon)
[![bitHound Overall Score](https://www.bithound.io/github/nomocas/babelute-html-lexicon/badges/score.svg)](https://www.bithound.io/github/nomocas/babelute-html-lexicon)
[![npm](https://img.shields.io/npm/v/babelute-html-lexicon.svg)]()
[![npm-downloads](https://img.shields.io/npm/dm/babelute-html-lexicon.svg)]()
[![licence](https://img.shields.io/npm/l/babelute-html-lexicon.svg)]()
[![dependecies](https://img.shields.io/david/nomocas/babelute-html-lexicon.svg)]()
[![dev-dependencies](https://img.shields.io/david/dev/nomocas/babelute-html-lexicon.svg)]()

> HTML javascript DSL. Remove "ml" from HTML.

This library is the Babelute(js) lexicon containing HTML related words.

It offers out-of-the-box :
- Natural and clean Pure Functional javascript syntax for writting HTML fragments.
- Natural Web Components definition and usage.
- Natural and clean React-like one-way data-binding (or no-binding-at-all).
- Natural and easy Dialects management.

And of course as a Babelute DSL, it could be used along with ALL other Babelute's DSL. 
Specifically, it will be used heavily as HTML translation target for any Babelute sentences that need HTML representation.

As all lexicon, it only gives words and does not provide any implementation.

So, it should be used in conjonction with an output engine (called Pragmatics in babelute's vocabulary) :
- [babelute-html-dom-pragmatics](https://github.com/nomocas/babelute-html-dom-pragmatics)
	- DOM Engine demo
- babelute-html-string-pragmatics
	- Ultra fast server side string rendering.
- [babelute-html-dom-diffing-pragmatics](https://github.com/nomocas/babelute-html-dom-diffing-pragmatics)
	- __One of the lightest__ modern pure js html lib avaiable (around 4Ko gzipped with dependencies) 
	- __One of the fastest DOM diffing engine__ (fastest than Mithril in chrome and firefox - several times faster than React)
	- Immutables based comparison. 
	- Algo that will show excellent behaviour when scalling. More components you have, more optimisation happend.
	- Play really well with other libs (redux, immutables, jquery, ...).
	- Simple and easy to understand algorithm. No more esoteric interpretation. You are the master.
- babelute-html-two-pass-pragmatics
	- Perfectly isomorphic HTML-to-String output. (work in progress)

And it could be extended for any other rendering engine. (example coming soon)

## Examples

- [babelute-html-todomvc](https://github.com/nomocas/babelute-html-todomvc)

## Benchmark

In the week... ;)

## Genesis

Please refer to [designing a DSL](https://github.com/nomocas/babelute/blob/master/manual/designing-dsl.md) to understand how this could be constructed and used.

Then take a look to sources. Everything is there.

More doc coming soon.

## Licence

The [MIT](http://opensource.org/licenses/MIT) License

Copyright 2016-2017 (c) Gilles Coomans <gilles.coomans@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
