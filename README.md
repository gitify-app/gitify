# Gitify 

[![CI Workflow][ci-workflow-badge]][github-actions] [![Release Workflow][release-workflow-badge]][github-actions] [![Coverage][coverage-badge]][coverage] [![Quality Gate Status][quality-badge]][quality] [![Renovate enabled][renovate-badge]][renovate] [![Contributors][contributors-badge]][github] [![Downloads - Total][downloads-total-badge]][website] [![Downloads - Latest Release][downloads-latest-badge]][website] [![OSS License][license-badge]][license] [![Latest Release][github-release-badge]][github-releases] [![Homebrew Cask][homebrew-cask-badge]][homebrew-cask]

> GitHub Notifications on your menu bar. Available on macOS, Windows and Linux.

![Gitify][gitify-social]

---

## Features

- 🔔 Unified notifications from GitHub Cloud & GitHub Enterprise Server
- 💻 Cross-platform: macOS, Windows, and Linux
- 🎨 Customizable settings, filters and themes
- 🖥️ Tray/menu bar integration
- ⚡ Fast, native experience


## Quick Start

1. **Download** Gitify for free from [gitify.io][website].
2. **Install** and launch the app for your platform.
3. **Authenticate** with your GitHub account, Personal Access Token or OAuth client/secret and start receiving notifications.


#### Homebrew
macOS users can also install via [Homebrew][brew]
```shell
brew install gitify
```


## Build & Development

To build and run Gitify locally:

```shell
pnpm install
pnpm build
pnpm dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for full development and contribution instructions.


## FAQ

See our [Gitify FAQs][faqs] for answers to common questions.


## Community & Support

- Open an [issue][github-issues] for bugs or feature requests
- See [CONTRIBUTING.md](CONTRIBUTING.md) for more ways to get involved


## License

Gitify is licensed under the MIT Open Source license. 
For more information, see [LICENSE](LICENSE).


<!-- LINK LABELS -->
[website]: https://gitify.io
[faqs]: https://gitify.io/faq
[gitify-social]: https://raw.githubusercontent.com/gitify-app/website/master/public/images/social.png

[github]: https://github.com/gitify-app/gitify
[github-actions]: https://github.com/gitify-app/gitify/actions
[github-issues]: https://github.com/gitify-app/gitify/issues
[github-releases]: https://github.com/gitify-app/gitify/releases/latest
[github-website]: https://github.com/gitify-app/website
[github-website-pulls]: https://github.com/gitify-app/website/pulls
[brew]: https://brew.sh/
[homebrew-cask]: https://formulae.brew.sh/cask/gitify

[coverage-badge]: https://img.shields.io/sonar/coverage/gitify-app_gitify?server=https%3A%2F%2Fsonarcloud.io&logo=sonarqubecloud
[coverage]: https://sonarcloud.io/summary/new_code?id=gitify-app_gitify
[quality-badge]: https://img.shields.io/sonar/quality_gate/gitify-app_gitify?server=https%3A%2F%2Fsonarcloud.io&logo=sonarqubecloud
[quality]: https://sonarcloud.io/summary/new_code?id=gitify-app_gitify

[ci-workflow-badge]: https://img.shields.io/github/actions/workflow/status/gitify-app/gitify/ci.yml?logo=github&label=CI
[release-workflow-badge]: https://img.shields.io/github/actions/workflow/status/gitify-app/gitify/release.yml?logo=github&label=Release
[downloads-total-badge]: https://img.shields.io/github/downloads/gitify-app/gitify/total?label=downloads@all&logo=github
[downloads-latest-badge]: https://img.shields.io/github/downloads/gitify-app/gitify/latest/total?logo=github
[contributors-badge]: https://img.shields.io/github/contributors/gitify-app/gitify?logo=github
[license]: LICENSE
[license-badge]: https://img.shields.io/github/license/gitify-app/gitify?logo=github
[github-release-badge]: https://img.shields.io/github/v/release/gitify-app/gitify?logo=github
[homebrew-cask-badge]: https://img.shields.io/homebrew/cask/v/gitify?logo=homebrew&logoColor=white
[renovate]: https://github.com/gitify-app/gitify/issues/576
[renovate-badge]: https://img.shields.io/badge/renovate-enabled-brightgreen.svg?logo=renovate&logoColor=white
