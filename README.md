Gitify [![Build Status](https://travis-ci.org/ekonstantinidis/gitify.svg?branch=master)](https://travis-ci.org/ekonstantinidis/gitify)
==========
GitHub Notifications on your menu bar.

![Gitify](images/press.png)

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
