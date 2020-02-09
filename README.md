# Gitify [![github][github-image]][github-url] [![codecov][codecov-image]][codecov-url] [![downloads][downloads-image]][downloads-url]

> The mobile app has been deprecated in favor of the official GitHub mobile app the is coming out [soon](https://github.com/mobile).

![Gitify](assets/images/press.png)

### Download

You can download Gitify for **free** from either the website [www.gitify.io](http://www.gitify.io/) or from the GitHub repository [releases](https://github.com/manosim/gitify/releases) page.

You can also install Gitify via [Homebrew Cask](http://brew.sh/)

```shell
brew cask install gitify
```

Gitify currently only supports OS X.

### Prerequisites

- Node 10+
- Yarn
- [Electron](https://electronjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Redux](http://redux.js.org/)

### Installation

    yarn install

### Development

First you will need to set the testing `CLIENT_ID` and `CLIENT_SECRET` in `src/js/utils/constants.js` file. You can use the development app credentials (use at your own discretion):

    Client Id: 3fef4433a29c6ad8f22c
    Client Secret Key: 9670de733096c15322183ff17ed0fc8704050379

To watch for changes in the `src` directory:

    yarn run watch

To run the actual **electron app**:

    yarn start

### Distribution

To prepare the app for distribution run:

    yarn run build
    yarn run pack
    yarn run make:macos

### Tests

There are 2 linters for `js` & `scss` and unit tests with `jest`.

    // Run only unit tests
    yarn run jest

    // Run linter & unit tests with coverage
    yarn run test

### FAQ

#### My notifications aren't showing?

Some organisations require applications to request access before allowing access to any data (including notifications) about their repositories.

To check if Gitify is approved by your organisation you can go to https://github.com/settings/applications, then click on **Gitify** and scroll to _Organization access_.

#### Something looks wrong - How can I debug?

Since version `1.1.0` you can now debug Gitify by pressing `alt+cmd+I`. This will open the devtools and then you can see any logs, network requests etc.

### Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request
6. Make sure tests are passing

### License

Gitify is licensed under the MIT Open Source license. For more information, see the LICENSE file in this repository.

[github-image]: https://github.com/manosim/gitify/workflows/CI/badge.svg
[github-url]: https://github.com/manosim/gitify/actions
[codecov-image]: https://codecov.io/gh/manosim/gitify/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/manosim/gitify
[downloads-image]: https://img.shields.io/github/downloads/manosim/gitify/total.svg
[downloads-url]: http://www.gitify.io
