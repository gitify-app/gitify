# Gitify
[![travis][travis-image]][travis-url]
[![cc-gpa][cc-gpa-image]][cc-gpa-url]
[![cc-coverage][cc-coverage-image]][cc-coverage-url]

[travis-image]: https://travis-ci.org/ekonstantinidis/gitify.svg?branch=master
[travis-url]: https://travis-ci.org/ekonstantinidis/gitify
[cc-gpa-image]: https://codeclimate.com/github/ekonstantinidis/gitify/badges/gpa.svg
[cc-gpa-url]: https://codeclimate.com/github/ekonstantinidis/gitify
[cc-coverage-image]: https://codeclimate.com/github/ekonstantinidis/gitify/badges/coverage.svg
[cc-coverage-url]: https://codeclimate.com/github/ekonstantinidis/gitify/coverage

### GitHub Notifications on your menu bar.

![Gitify](images/press.png)

### Download
You can download Gitify from the [releases](https://github.com/ekonstantinidis/gitify/releases) page. Currently only supports OS X.

### Prerequisites

 - [Electron](http://electron.atom.io/)
 - [React](https://facebook.github.io/react/)
 - [Grunt](http://gruntjs.com/)
 - [NPM](https://www.npmjs.com/)


### Installation

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


### Tests
There are 3 types of tests: `jest`, `jscs` and `jsxhint`.
To run the tests:

    npm test


### Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request
6. Make sure tests are passing

### License
Gitify is licensed under the MIT Open Source license. For more information, see the LICENSE file in this repository.
