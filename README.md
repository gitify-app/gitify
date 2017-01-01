# Gitify [![travis][travis-image]][travis-url] [![codecov][codecov-image]][codecov-url] [![slack][slack-image]][slack-url]

> If you are looking for the mobile version - [manosim/gitify-mobile](https://github.com/manosim/gitify-mobile/).

![Gitify](images/press.png)


### Version 1.0.0 is now out!

> Gitify finally reaches version **1.0.0**. The app has been rewritten from scratch using React v15, Redux, Bootstrap 4 and more. This allows me to prepare the surface for more features (GitHub Enterprise etc). Unfortunately, due to a change in the auto-update package API, you will have **to download the update manually**. This is now fixed and you won't have to download any updates manually again. Finally the user settings will be reset with the new version. Hope you like it and feel free to give me some feedback!

> Cheers,

> Manos


### Download
You can download Gitify for **free** from either the website [www.gitify.io](http://www.gitify.io/) or from the GitHub repository [releases](https://github.com/manosim/gitify/releases) page.

You can also install Gitify via [Homebrew Cask](http://caskroom.io/)

```shell
brew cask install gitify
```

Gitify currently only supports OS X.


### Prerequisites

 - Node 6+
 - [Electron](http://electron.atom.io/)
 - [React](https://facebook.github.io/react/)
 - [Gulp](https://www.gulpjs.com)


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


[travis-image]: https://travis-ci.org/manosim/gitify.svg?branch=master
[travis-url]: https://travis-ci.org/manosim/gitify
[codecov-image]: https://codecov.io/gh/manosim/gitify/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/manosim/gitify
[slack-image]: https://img.shields.io/badge/slack-atomio/gitify-e01563.svg
[slack-url]: https://atomio.slack.com/
