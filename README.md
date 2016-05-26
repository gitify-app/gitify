# Gitify
[![travis][travis-image]][travis-url]
[![codecov][codecov-image]][codecov-url]
[![slack][slack-image]][slack-url]

### GitHub Notifications on your menu bar.

![Gitify](images/press.png)


### Roadmap Version 1.0.0
It has been a while since this app was made so I decided to give it a good revamp and hit **1.0.0**. This will bring the app up to date and prepare it for the future. So below you can find all the changes coming up to Version 1.0.0. From the normal user's point of view, nothing will break. People contributing, will probably want to have a look to the list below. Once we are done with this list(if not at the same time), I think it will be time to distribute the app to Linux & Windows.

- [x] Update all (dev)dependendencies - Things tend to evolve fast in the js commumity.
- [x] Update Electron - Electron gets better and better in every release.
- [x] From Browserify to Webpack - In the future we can have Hot Module Replacement!
- [x] React 15.0+ - Major React Update.
- [x] Use ES6 - Because ES6!
- [x] Move from Reflux to Redux - I've spent some time rewriting gitify to redux. It's just amazing.
- [x] Update Bootstrap to version 4 - Which means move from LESS to SCSS.
- [x] Rewrite tests with Mocha - Since gitify is moving from Reflux to Redux, all tests have to be rewritten.
- [x] Move to Codecov for coverage with new tests
- [ ] Revamp the UI. From Scratch?
- [ ] Rebranding - New Logo! Fresh stuff!

If you would like to help let me know! There is a slack channel for gitify in the [atom](http://atomio.slack.com) team. See badge on the header.


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
