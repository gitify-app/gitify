# Gitify [![github][github-image]][github-url] [![coveralls][coveralls-image]][coveralls-url] [![downloads][downloads-image]][downloads-url]

> GitHub Notifications on your menu bar. Available on macOS, Windows and Linux. Gitify Mobile has been deprecated in favour of the official [GitHub mobile app](https://github.com/mobile).

![Gitify](assets/images/press.png)

### Download

You can download Gitify for **free** from the website [www.gitify.io](https://www.gitify.io/) or install it via [Homebrew Cask](http://brew.sh/).

```shell
brew install --cask gitify
```

Gitify supports macOS, Windows and Linux.

### Installation

    pnpm install

### Development

Optional: If you prefer to use your own OAuth credentials, you can do so by passing them as environment variables when bundling the app. This is optional as the app has some default "development" keys (use at your own discretion).

    OAUTH_CLIENT_ID="123" OAUTH_CLIENT_SECRET="456789" pnpm build

To watch for changes(`webpack`) in the `src` directory:

    pnpm watch

To run the **electron app**:

    pnpm start

### Releases

The release process is automated. Follow the steps below.

1. Create a [new **draft** release](https://github.com/manosim/gitify/releases/new). Set the tag version to something with the format of `v1.2.3`. Save as a **draft**.
2. Once everything is merged to `main`, create a branch that starts with `release/vX.X.X` (ie. `release/v1.2.3`).
3. In the same branch, **bump the version** of the app in the `package.json` file and open a PR. GitHub Actions will build, sign and upload the release assets for each commit to that branch as long as a branch is named like `release/vX.X.X` and there is a draft release with the same version number(`package.json`).
4. Attach each of the [release artifacts](https://github.com/gitify-app/gitify/actions/workflows/release.yml) to the draft release notes
5. Merge your release branch into `main`.
6. Publish the draft release once you've added notes to it and all assets are there.
7. Merge the open pull request in [gitify-app/website](https://github.com/gitify-app/website/pulls) (ie: `bump/v1.2.3`)

### Tests

There are 2 checks - one for prettier and one for the unit tests with `jest`.

```
    // Run prettier to check
    pnpm prettier:check

    // Run linter & unit tests with coverage
    pnpm test

    // If you want to pass arguments to jest (or other `pnpm` commands)
    // like `--watch`, you can prepend `--` to the command
    pnpm test -- --watch
```

### FAQ

#### My notifications aren't showing?

Some organisations require applications to request access before allowing access to any data (including notifications) about their repositories.

To check if Gitify is approved by your organisation you can go to https://github.com/settings/applications, then click on **Gitify** and scroll to _Organization access_.

#### Something looks wrong - How can I debug?

You can debug Gitify by pressing <kbd>alt</kbd> + <kbd>command</kbd> + <kbd>I</kbd>. This will open the dev tools and then you can see any logs, network requests etc.

### Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request
6. Make sure tests are passing

### License

Gitify is licensed under the MIT Open Source license. For more information, see the LICENSE file in this repository.

[github-image]: https://github.com/gitify-app/gitify/actions/workflows/build-app.yml/badge.svg
[github-url]: https://github.com/gitify-app/gitify/actions
[coveralls-image]: https://coveralls.io/repos/github/gitify-app/gitify/badge.svg
[coveralls-url]: https://coveralls.io/github/gitify-app/gitify
[downloads-image]: https://img.shields.io/github/downloads/gitify-app/gitify/total.svg
[downloads-url]: https://www.gitify.io
