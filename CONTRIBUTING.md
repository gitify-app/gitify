# Gitify Contributing Guide

Hi! We're really excited that you're interested in contributing to Gitify!

Before submitting your contribution, please read through the following guide.

We also suggest you read the [Project Philosophy](#project-philosophy) in our documentation.

### Getting Started

> [!TIP]
> _Optional: If you prefer to use your own OAuth credentials, you can do so by passing them as environment variables when bundling the app. This is optional as the app has some default "development" keys (use at your own discretion)._
>
> ```shell
> OAUTH_CLIENT_ID="123" pnpm build
> ```

To get started:

Clone the repository and install dependencies:

```shell
pnpm install
```

Copy the `.env.template` to `.env` and add update `GITHUB_TOKEN` with a GitHub Personal Access Token. This is used for fetching the latest GitHub GraphQL API schema for `graphql-codegen`.

```shell
GITHUB_TOKEN=<some personal access token>
```

Start development mode (includes GraphQL codegen and hot module reload):

```shell
pnpm dev
```

### Tests

Tooling is unified through [Vite+][vite-plus-website], which bundles the linter (oxlint), formatter (oxfmt), test runner (Vitest), and dev/build pipeline (Vite).

> [!IMPORTANT]
> `vite-plus`, `vite`, `vitest`, and the `@vitest/*` family are version-coupled: `vite-plus` bundles/targets a specific `vite`/`vitest` release internally, and this project depends on the same real packages directly. Bumping one side independently has broken the test suite before by loading two different `vitest` copies into the test workers. Renovate groups these packages into a single PR, and CI (`vp migrate --no-interactive`, currently advisory) fails if they drift apart — but if you ever bump one of these packages by hand, always run `pnpm exec vp migrate` afterward and let it manage `package.json`/`pnpm-workspace.yaml` (catalog references), rather than pinning a raw version yourself. See `openspec/changes/fix-vite-plus-dependency-drift` for the incident history.

```shell
# Run lint, format, and type checks
pnpm check

# Auto-fix formatting and lint issues
pnpm check:fix

# Run unit tests with coverage
pnpm test

# Update vitest snapshots
pnpm test -u
```

#### Visual regression tests

`pnpm test` covers the DOM snapshots. Pixel-level regressions (colour tokens,
spacing, theme changes) are covered separately by a browser-mode project that
screenshots every route across the light, dark, accessibility, and Glass themes.

Screenshots only match when the browser build and font stack are identical, so
both commands below run the suite inside a pinned Playwright container, and CI
verifies against that same container. You do not need to install Playwright's
browsers locally.

```shell
# Verify against the committed baselines
pnpm test:visual

# Regenerate them after an intentional UI change
pnpm test:visual:update
```

Both need Docker on an arm64 host, because Chromium crashes under amd64
emulation on Apple Silicon. On any other machine, push the branch and read the
diff from the Visual Regression job's `visual-regression-diffs` artifact.

Do not invoke the `browser [visual]` project through `vitest` directly. Vitest
namespaces baselines per platform and creates missing ones automatically, so a
bare run on macOS writes a fresh set from your working tree and then passes
against it — reporting green even on a branch that has a real regression. A
guard fails the run outside Linux rather than letting that happen.

Note that these baselines capture the `backdrop-filter` fallback for Glass, not
the macOS native vibrancy material, which Chromium cannot render.

### Code Style & Conventions

- Linting and formatting are configured in `vite.config.mts` (the `lint` and `fmt` blocks). Please run `pnpm check` before submitting a PR.
- Follow existing file and folder naming conventions.
- Keep commit messages clear and descriptive.

### How to Report Bugs or Request Features

If you encounter a bug or have a feature request, please [open an issue][github-issues] with clear steps to reproduce or a detailed description of your idea. Check for existing issues before creating a new one.

### Releases

Releases are automated with [release-please][release-please]. There is no release branch and no manual version bump.

1. **Merge changes into `main`.** Use [Conventional Commits][conventional-commits] for PR titles (`feat:`, `fix:`, `docs:`, `chore(deps):`, ...). The commit type decides the version bump and the changelog section it lands in.
2. **Review the release PR.** release-please keeps an open `chore: release X.Y.Z` pull request up to date as commits land. It bumps the version in `package.json`, regenerates `CHANGELOG.md`, and updates `sonar.projectVersion` in `sonar-project.properties`. Check the [Renovate Dependency Dashboard][github-dependency-dashboard] for any dependency updates you want to include first.
3. **Merge the release PR when you are ready to ship.** Merging is the "go" decision. GitHub Actions then automatically:

- builds, signs, and notarizes the app on macOS, Windows, and Linux,
- attaches the assets to the release that release-please drafted, and
- publishes the release (creating the `vX.Y.Z` tag), which redeploys the website and triggers the automatic [Homebrew cask bump][homebrew-cask-autobump-workflow] (workflow runs ~3 hours).

4. **(Optional) Update milestones:**

- Edit the current [Milestone][github-milestones]: add a link to the release notes, set the due date to the release date, and close it.
- Create a [New Milestone][github-new-milestone] for the next release cycle.

### Design Guidelines

1. Use sentence case where possible
2. Use GitHub's [Octicons][github-octicons] for iconography

### Project Philosophy

This project is a tool for monitoring new notifications from supported Git forges. It's not meant to be a full-featured forge client. We want to keep it simple and focused on that core functionality. We're happy to accept contributions that help us achieve that goal, but we're also happy to say no to things that don't. We're not trying to be everything to everyone.

#### Multi-forge support

Gitify supports notifications from multiple Git forges. New forges may be added under the following conditions:

- **Adapter-based:** the forge is implemented behind the `ForgeAdapter` interface in `src/renderer/utils/forges/`. No forge-specific branching outside the adapter module.
- **Designated maintainer:** every forge has at least one named maintainer in [`MAINTAINERS.md`](./MAINTAINERS.md) who owns triage and CI for that adapter.
- **Capability-honest UI:** features unsupported by a forge (e.g. mark-as-done) must hide gracefully, not silently no-op.
- **No core-platform churn:** Octicons, Octokit, and the Primer Design System remain in place. Octokit is scoped to the GitHub adapter; other adapters use plain `fetch`.

Currently supported forges: **GitHub** (Cloud, Enterprise Server, Enterprise Cloud with Data Residency), **Gitea** (incl. Forgejo, Codeberg), **Bitbucket Cloud** and **GitLab** (Cloud and Self-Managed).

#### Things we won't do

- Operating-system level features
  - Do not disturb, including on schedules. https://github.com/gitify-app/gitify/issues/416#issuecomment-1746480130
  - Persistent notifications like https://github.com/gitify-app/gitify/issues/281. e.g. macOS has Alerts, instead of Banners, which makes them persistent
- Seeing past notifications. This is a tool for monitoring new notifications, not seeing old ones, which can be seen at https://github.com/notifications.
- Specific UX/UI changes that add options and/or visual complexity for minor workflow improvements. e.g. https://github.com/gitify-app/gitify/issues/358, https://github.com/gitify-app/gitify/issues/411 and https://github.com/gitify-app/gitify/issues/979
- UI for something that isn't core to Gitify, and/or can be trivially done another way. e.g. https://github.com/gitify-app/gitify/issues/476 and https://github.com/gitify-app/gitify/issues/221
- Add a forge adapter without a designated maintainer who will own it long-term.

<!-- LINK LABELS -->

[vite-plus-website]: https://viteplus.dev/
[conventional-commits]: https://www.conventionalcommits.org
[release-please]: https://github.com/googleapis/release-please
[github-dependency-dashboard]: https://github.com/gitify-app/gitify/issues/576
[github-issues]: https://github.com/setchy/gitify/issues
[github-milestones]: https://github.com/gitify-app/gitify/milestones
[github-new-milestone]: https://github.com/gitify-app/gitify/milestones/new
[github-new-release]: https://github.com/gitify-app/gitify/releases/new
[github-octicons]: https://primer.style/foundations/icons
[homebrew-cask-autobump-workflow]: https://github.com/Homebrew/homebrew-cask/actions/workflows/autobump.yml
[vitest-website]: https://vitest.dev/
