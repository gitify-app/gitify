# Gitify
[![travis][travis-image]][travis-url] [![codecov][codecov-image]][codecov-url] [![slack][slack-image]][slack-url]

![Gitify](images/press.png)


### Version 1.0.0
Gitify finally reaches version **1.0.0**. The app has been rewritten from scratch using React v15, Redux, Bootstrap 4 and more. This allows me to prepare the surface for more features (for GitHub Enterprise etc). Unfortunately, due to a change in the auto-update package API, you will have **to download the update manually**. This is now fixed and you won't have to download any updates manually again.


### Download
You can download Gitify for **free** from either the website [www.gitify.io](http://www.gitify.io/) or from the GitHub repository [releases](https://github.com/ekonstantinidis/gitify/releases) page.

You can also install Gitify via [Homebrew Cask](http://caskroom.io/)

```shell
brew cask install gitify
```

Gitify currently only supports OS X.


### Prerequisites

 - [Electron](http://electron.atom.io/)
 - [React](https://facebook.github.io/react/)
 - [Webpack](https://webpack.github.io/)
 - [NPM](https://www.npmjs.com/)


### Installation

    npm install


### Development
First you will need to set the testing `CLIENT_ID` and `CLIENT_SECRET` in `src/js/utils/constants.js` file. You can use the development app credentials (use at your own discretion):

    Client Id: 3fef4433a29c6ad8f22c
    Client Secret Key: 9670de733096c15322183ff17ed0fc8704050379


To watch for changes in the `src` directory:

    npm run watch

To run the actual **electron app**:

    npm start


### Distribution
To prepare the app for distribution run:

    npm run package

To publish a new version, you also need to codesign the app running `npm run codesign`. Currently supports only OS X.


### Tests
There are 2 linters for `js` & `scss` and unit tests with `mocha`.

    // Run all tests
    npm run test

    // Run only unit tests
    npm run mocha

    // Run unit tests with coverage
    npm run coverage


### Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request
6. Make sure tests are passing


### License
Gitify is licensed under the MIT Open Source license. For more information, see the LICENSE file in this repository.


[travis-image]: https://travis-ci.org/ekonstantinidis/gitify.svg?branch=master
[travis-url]: https://travis-ci.org/ekonstantinidis/gitify
[codecov-image]: https://codecov.io/gh/ekonstantinidis/gitify/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/ekonstantinidis/gitify
[slack-image]: https://img.shields.io/badge/slack-atomio/gitify-e01563.svg
[slack-url]: https://atomio.slack.com/
