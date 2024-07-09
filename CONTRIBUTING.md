# Gitify Contributing Guide

Hi! We're really excited that you're interested in contributing to Gitify! Before submitting your contribution, please read through the following guide. We also suggest you read the [Project Philosophy](#project-philosophy) in our documentation.

### Installation

To get started, you'll need to clone the repository and install the dependencies.

```shell
pnpm install
```

### Development

Optional: If you prefer to use your own OAuth credentials, you can do so by passing them as environment variables when bundling the app. This is optional as the app has some default "development" keys (use at your own discretion).

```shell
OAUTH_CLIENT_ID="123" OAUTH_CLIENT_SECRET="456789" pnpm build
```

To watch for changes (`webpack`) in the `src` directory:

```shell
pnpm watch
```

To run the **electron app**:

```shell
pnpm start
```

To reload the app with the changes that `pnpm watch` has detected, you can use the `CmdOrCtrl+R` shortcut.

### Tests

There are 2 checks:
1. linter & formatter with [biome][biome-website]
2. unit tests with [jest][jest-website]

```shell
# Run biome to check linting and formatting
pnpm lint:check

# Run unit tests with coverage
pnpm test

# If you want to pass arguments to jest (or other `pnpm` commands)
# like `--watch`, you can prepend `--` to the command
pnpm test -- --watch
```

### Releases

The release process is automated. Follow the steps below.

1. Verify that all features you want targeted in the release have been merged to `main`.
2. Check the [Renovate Dependency Dashboard][github-dependency-dashboard] to see if there are any updates you want included.
3. Create a [new **draft** release][github-new-release]. Set the tag version to something with the format of `v1.2.3`. Save as a **draft** before moving to the next step
4. Create a branch that starts with `release/vX.X.X` (ie. `release/v1.2.3`).
5. In the same branch, **bump the version** of the app by running `pnpm version <new-version-number`. Commit these changes and open a PR. A GitHub Actions workflow will build, sign and upload the release assets for each commit to that branch as long as a branch is named like `release/vX.X.X` and there is a draft release with the same version number(`package.json`).
6. Merge your release branch into `main`.
7. Publish the release once you've finalized the release notes and confirmed all assets are there.
8. Edit current [Milestone][github-milestones] to have: 
   * description: link to the release notes
   * due date: date of release
   * close milestone
9. Create new [Milestone][github-milestones] for upcoming release.
10. A new homebrew cask will be automatically published (workflow runs ~3 hours)

### Project Philosophy

This project is a tool for monitoring new notifications from Github. It's not meant to be a full-featured Github client. We want to keep it simple and focused on that core functionality. We're happy to accept contributions that help us achieve that goal, but we're also happy to say no to things that don't. We're not trying to be everything to everyone. 

#### Things we won't do

* Operating-system level features
  * Do not disturb, including on schedules. https://github.com/gitify-app/gitify/issues/416#issuecomment-1746480130
  * Persistent notifications like https://github.com/gitify-app/gitify/issues/281. e.g. macOS has Alerts, instead of Banners, which makes them persistent
* Seeing past notifications. This is a tool for monitoring new notifications, not seeing old ones, which can be seen at https://github.com/notifications.
* Specific UX/UI changes that add options and/or visual complexity for minor workflow improvements. e.g. https://github.com/gitify-app/gitify/issues/358, https://github.com/gitify-app/gitify/issues/411 and https://github.com/gitify-app/gitify/issues/979
* UI for something that isn't core to Gitify, and/or can be trivially done another way. e.g. https://github.com/gitify-app/gitify/issues/476 and https://github.com/gitify-app/gitify/issues/221
* Support anything other than Github. Doing so would be a major undertaking that we may consider in future, but it would be a ton of work and there's so much tied to Github right now that it's not something I'd want to maintain.

<!-- LINK LABELS -->
[biome-website]: https://biomejs.dev/
[github-dependency-dashboard]: https://github.com/gitify-app/gitify/issues/576
[github-milestones]: https://github.com/gitify-app/gitify/milestones
[github-new-release]: https://github.com/gitify-app/gitify/releases/new
[jest-website]: https://jestjs.io/

