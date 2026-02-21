# Gitify Contributing Guide

Hi! We're really excited that you're interested in contributing to Gitify! 

Before submitting your contribution, please read through the following guide. 

We also suggest you read the [Project Philosophy](#project-philosophy) in our documentation.

### Getting Started
> [!TIP]
> _Optional: If you prefer to use your own OAuth credentials, you can do so by passing them as environment variables when bundling the app. This is optional as the app has some default "development" keys (use at your own discretion)._
> ```shell
> OAUTH_CLIENT_ID="123" pnpm build
> ```

To get started:

Clone the repository and install dependencies:
  ```shell
  pnpm install
  ```

Copy the `.env.template` to `.env` and add update `GITHUB_TOKEN` with a GitHub Personal Access Token.  This is used for fetching the latest GitHub GraphQL API schema for `graphql-codegen`.
```shell
GITHUB_TOKEN=<some personal access token>
```

Build static resources (tray icons, twemojis, etc). You only need to rebuild if you change static assets:
  ```shell
  pnpm build
  ```

Start development mode (includes GraphQL codegen and hot module reload):
  ```shell
  pnpm dev
  ```

> [!NOTE]
> This will also install React Developer Tools extension automatically so you can inspect the renderer process.
> Make sure you force a reload when first opening the `Developer Tools`.


### Tests

There are two main checks:
1. Linter & formatter with [Biome][biome-website]
2. Unit tests with [Vitest][vitest-website]

```shell
# Run biome to check linting and formatting
pnpm lint:check

# Run unit tests with coverage
pnpm test

# Update vitest snapshots
pnpm test -u
```

### Code Style & Conventions

- We use [Biome][biome-website] for linting and formatting. Please run `pnpm lint:check` before submitting a PR.
- Follow existing file and folder naming conventions.
- Keep commit messages clear and descriptive.

### How to Report Bugs or Request Features

If you encounter a bug or have a feature request, please [open an issue][github-issues] with clear steps to reproduce or a detailed description of your idea. Check for existing issues before creating a new one.


### Releases

The release process is automated. Follow the steps below.

1. **Verify features:** Ensure all features and fixes you want included in the release are merged into `main`.
2. **Check dependencies:** Review the [Renovate Dependency Dashboard][github-dependency-dashboard] for any dependency updates you want to include.
3. **Create a release branch:**
  - Name your branch `release/vX.X.X` (e.g., `release/v1.2.3`).
  - Run `pnpm version <new-version-number>` to **bump the version** in `package.json` and create a version commit/tag.
  - Update `sonar.projectVersion` within `sonar-project.properties`
  - Commit and push these changes.
  - Open a Pull Request (PR) from your release branch. 
4. **GitHub release:** GitHub Actions will automatically build, sign, and upload release assets to a new draft release with automated release notes.
5. **Merge the release branch:** Once the PR is approved and checks pass, merge your release branch into `main`.
6. **Publish the release:**
  - Finalize the release notes in the draft release on GitHub.
  - Confirm all assets are present and correct.
  - Publish the release.
7. **Update milestones:**
  - Edit the current [Milestone][github-milestones]:
    - Add a link to the release notes in the description.
    - Set the due date to the release date.
    - Close the milestone.
  - Create a [New Milestone][github-new-milestone] for the next release cycle.
8. A new homebrew cask will be [automatically published][homebrew-cask-autobump-workflow] (workflow runs ~3 hours)

### Design Guidelines

1. Use sentence case where possible
2. Use GitHub's [Octicons][github-octicons] for iconography

### Project Philosophy

This project is a tool for monitoring new notifications from GitHub. It's not meant to be a full-featured GitHub client. We want to keep it simple and focused on that core functionality. We're happy to accept contributions that help us achieve that goal, but we're also happy to say no to things that don't. We're not trying to be everything to everyone. 

#### Things we won't do

* Operating-system level features
  * Do not disturb, including on schedules. https://github.com/gitify-app/gitify/issues/416#issuecomment-1746480130
  * Persistent notifications like https://github.com/gitify-app/gitify/issues/281. e.g. macOS has Alerts, instead of Banners, which makes them persistent
* Seeing past notifications. This is a tool for monitoring new notifications, not seeing old ones, which can be seen at https://github.com/notifications.
* Specific UX/UI changes that add options and/or visual complexity for minor workflow improvements. e.g. https://github.com/gitify-app/gitify/issues/358, https://github.com/gitify-app/gitify/issues/411 and https://github.com/gitify-app/gitify/issues/979
* UI for something that isn't core to Gitify, and/or can be trivially done another way. e.g. https://github.com/gitify-app/gitify/issues/476 and https://github.com/gitify-app/gitify/issues/221
* Support anything other than GitHub. Doing so would be a major undertaking that we may consider in future.

<!-- LINK LABELS -->
[biome-website]: https://biomejs.dev/
[github-dependency-dashboard]: https://github.com/gitify-app/gitify/issues/576
[github-issues]: https://github.com/setchy/gitify/issues
[github-milestones]: https://github.com/gitify-app/gitify/milestones
[github-new-milestone]: https://github.com/gitify-app/gitify/milestones/new
[github-new-release]: https://github.com/gitify-app/gitify/releases/new
[github-octicons]: https://primer.style/foundations/icons
[homebrew-cask-autobump-workflow]: https://github.com/Homebrew/homebrew-cask/actions/workflows/autobump.yml
[vitest-website]: https://vitest.dev/

