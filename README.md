# Gitify
[![travis][travis-image]][travis-url]
[![coveralls][coveralls-image]][coveralls-url]

[travis-image]: https://travis-ci.org/ekonstantinidis/gitify.svg?branch=master
[travis-url]: https://travis-ci.org/ekonstantinidis/gitify
[coveralls-image]: https://coveralls.io/repos/ekonstantinidis/gitify/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/ekonstantinidis/gitify?branch=master

### GitHub Notifications on your menu bar.

![Gitify](images/press.png)

### Installation
You can download Gitify from the [releases](https://github.com/ekonstantinidis/gitify/releases) page. Currently only supports OS X.

### Prerequisites

 - Electron [+](http://electron.atom.io/)
 - React [+](https://facebook.github.io/react/)
 - Grunt [+](http://gruntjs.com/)
 - NPM [+](https://www.npmjs.com/)


### Installation
If you encounter any issues with `npm install`, then run `ulimit -n 512`.

    npm install


    ### Development
    To watch for changes in the `src` directory:

        npm run watch

    To run the actual **electron app**:

        npm start


### Distribution
To prepare the app for distribution run:

      npm run dist

Currently supports only OS X.


### Tests (JsxHint)

    npm test


### License

The MIT License (MIT)

Copyright (c) 2015 Emmanouil Konstantinidis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
