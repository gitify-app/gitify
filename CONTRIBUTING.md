# Gitify Contributing Guide

Hi! We're really excited that you're interested in contributing to Gitify!

Before submitting your contribution, please read through the following guide.

We also suggest you read the [Project Philosophy](#project-philosophy) in our documentation.

### 🚀 Getting Started

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

Development builds keep their settings, cache, and logs in a separate user data directory, so you can run `pnpm dev` while an installed Gitify is running. Sign-in and settings are therefore separate from the installed app.

### 🛠️ Tests

Tooling is unified through [Vite+][vite-plus-website], which bundles the linter (oxlint), formatter (oxfmt), test runner (Vitest), and dev/build pipeline (Vite).

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

#### 🧪 Visual regression tests

`pnpm test` covers the DOM snapshots. Pixel-level regressions (colour tokens,
spacing, theme changes) are covered separately by a browser-mode project that
screenshots every route in Classic light, Classic dark, Glass light, and Glass
dark, with accessibility and high-contrast variants on the densest routes. It
also captures high-value states — open help popovers, the notification action
rail on hover, read and failed rows, empty/offline/error inboxes, active filter
selections, choice controls, settings reveals, the loading splash, the
reset-settings confirmation, the Accounts add-account menu, and representative
login errors.

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

#### 🔔 Native notification checks

Operating-system notifications are created in the main process. Each unread notification offers a single **Mark as read** action, and clicking the body opens the notification target.

- **macOS**: native notifications require a code-signed app. Electron ships ad-hoc _linker_-signed, which macOS rejects for `UNUserNotificationCenter`, so `pnpm dev` re-signs the development Electron bundle automatically before starting. Ad-hoc signing is the default and needs no certificate; set `GITIFY_DEV_SIGN_IDENTITY` to use a Developer ID or Apple Development identity. Run `pnpm dev` again after `pnpm install` or an Electron upgrade. The same step sets `NSUserNotificationAlertStyle: alert` for development, and the packaged app declares it in its `Info.plist`.
- **Windows**: toast interactions arrive through the notification instance events; verify Action Center persistence and cold-start activation manually.
- **Linux**: the action button appears only when the desktop notification server advertises the `actions` capability. Without it, the notification still shows without a button.

Verify the notification content, body click, Mark as read, and removal-on-read on macOS, Windows, and an action-capable Linux desktop before releasing a change in this area.

### Translations

Gitify's interface is translated through [i18next][i18next-website]. The app ships English as the only locale today, but the infrastructure supports additional languages — adding one is a contributor-friendly change.

- Translation files live in `src/renderer/i18n/locales/` (e.g. `en.json`).
- `en.json` is generated from the code, never hand-edited. Write the English text as the second argument of `t()`, and as `defaults` on `<Trans>`:

  ```tsx
  t('common.save', 'Save');
  t('login.device.opened', 'Opened {{hostname}}', { hostname });
  <Trans
    i18nKey="filters.requires_detailed"
    components={[<strong key={0} />]}
    defaults="Requires <0>Detailed Notifications</0>."
  />;
  ```

- After changing a string, sync the locale files:
  - `pnpm i18n:extract` — regenerate/update locale files from the `t()` calls in the source
  - `pnpm i18n:check` — verify the keys are in sync with the code, every `t()`/`<Trans>` has an English default, and `en.json` has no empty or key-path values (also runs in CI)
  - `pnpm i18n:lint` — flag hardcoded or untranslated UI strings
  - `pnpm i18n:status` — locale health summary
- Don't run `i18next-cli extract --trust-derived`: it replaces real English text with key names.
- To add a language:
  1. Create `src/renderer/i18n/locales/<lang>.json`, copying `en.json` as a starting point.
  2. Register it in `SUPPORTED_LANGUAGES` in `src/renderer/i18n/types.ts` (this also surfaces it in the Appearance → Language selector).
  3. Import it in the `locales` map in `src/renderer/i18n/loader.ts`.
  4. Translate the keys. The [i18n Ally][i18n-ally-website] VSCode extension is handy for working through JSON keys.
  5. Run `pnpm i18n:check` and `pnpm test`.
- Translation keys use `snake_case`, grouped by feature (e.g. `settings.appearance.language`). Prefer whole-sentence keys with `{{placeholder}}` interpolation over string concatenation, and leave brand names (GitHub, GitLab, …) untranslated.
- When a sentence contains markup (bold, links, tooltips), keep it as one `<Trans>` string instead of splitting it into several `t()` fragments, so translators can reorder the words. A component that requires a single child (e.g. Primer's `Tooltip`) needs a small wrapper that accepts `children`.

### 🎨 Code Style & Conventions

- Linting and formatting are configured in `vite.config.mts` (the `lint` and `fmt` blocks). Please run `pnpm check` before submitting a PR.
- Renderer React components are defined as function declarations. `React.FC` is reserved for typing a component value (a prop or return type), never a component definition; `react/function-component-definition` enforces this.
- Follow existing file and folder naming conventions.
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for the renderer's module layering, state ownership, and side-effect conventions.
- Keep commit messages clear and descriptive.

#### 📝 TSDoc

Every TSDoc block follows the [TSDoc][tsdoc-website] standard. Add TSDoc to
exported APIs whose contract is not obvious from the signature; trivial
presentational components may omit it. Existing files are not the standard:
proposals and new changes follow this section.

- Start with a one-sentence summary.
- Document every parameter with `@param name - description`. Put optional or
  default behaviour in the description; never add JSDoc type annotations.
- Use `@returns` (not `@return`) for every non-void return. Describe the
  resolved value, its format, or its success and failure branches. Do not
  repeat the TypeScript type or write "Promise resolving to".
- Let named result types own object shapes. Document fields on the type, then
  name or link the type from `@returns` instead of restating the shape.
- Use `@throws` for each thrown error condition, `@remarks` for extended
  context, `@example` for non-obvious usage, and `@typeParam` for generic
  parameters.
- Use `{@link Symbol}` for internal references and backticks for identifiers
  and literals.
- Omit `@returns` for `void` and `Promise<void>`.
- Update TSDoc in the same pull request as the behaviour change. Do not
  suppress a TSDoc lint finding; fix it or change this convention in a separate
  proposal.

```ts
/**
 * Read the token the locally installed GitHub CLI holds for a host.
 *
 * @param hostname - Host to read the token for (e.g. `github.com`).
 * @returns The CLI token, or a classified failure with an optional detail line.
 */
```

TSDoc syntax is validated by the shared lint configuration through `pnpm check`.

### 🐛 How to Report Bugs or Request Features

If you encounter a bug or have a feature request, please [open an issue][github-issues] with clear steps to reproduce or a detailed description of your idea. Check for existing issues before creating a new one.

### 🚢 Releases

Releases are automated with [release-please][release-please]. There is no release branch and no manual version bump.

1. **Merge changes into `main`.** Use [Conventional Commits][conventional-commits] for PR titles (`feat:`, `fix:`, `docs:`, `chore(deps):`, ...). The commit type decides the version bump and the changelog section it lands in.
2. **Review the release PR.** release-please keeps an open `chore: release X.Y.Z` pull request up to date as commits land. It bumps the version in `package.json`, regenerates `CHANGELOG.md`, and updates `sonar.projectVersion` in `sonar-project.properties`. Check the [Renovate Dependency Dashboard][github-dependency-dashboard] for any dependency updates you want to include first.
3. **Merge the release PR when you are ready to ship.** Merging is the "go" decision. GitHub Actions then automatically:

- builds, signs, and notarizes the app on macOS, Windows, and Linux,
- attaches the assets to the release that release-please drafted, and
- publishes the release (creating the `vX.Y.Z` tag), which redeploys the website and triggers the automatic [Homebrew cask bump][homebrew-cask-autobump-workflow] (workflow runs ~3 hours).

4. **Milestones and notifications are automated.**

- An open [Milestone][github-milestones] titled `Release X.Y.Z` is kept in step with the release-please version, and merged pull requests are attached to it as they land.
- When the release is published, the milestone is finalized: its description becomes the release URL, its due date is set to the release date, and it is closed.
- A separate job comments once on every pull request included in the release, linking contributors to the release page. Re-runs are idempotent and never post duplicate comments.

No manual milestone creation, renaming, or closing is required.

#### 🔐 Release automation permissions

- Packaging and publication use `contents: write`.
- The milestone automation uses `issues: write`.
- Pull request notification uses `issues: write`, `pull-requests: write`, and `contents: read`.
- The validation jobs (`lint`, `tests`) remain read-only.

### 🖌️ Design Guidelines

1. Use sentence case where possible
2. Use GitHub's [Octicons][github-octicons] for iconography

### 🧭 Project Philosophy

This project is a tool for monitoring new notifications from supported Git forges. It's not meant to be a full-featured forge client. We want to keep it simple and focused on that core functionality. We're happy to accept contributions that help us achieve that goal, but we're also happy to say no to things that don't. We're not trying to be everything to everyone.

#### 🔌 Multi-forge support

Gitify supports notifications from multiple Git forges. New forges may be added under the following conditions:

- **Adapter-based:** the forge is implemented behind the `ForgeAdapter` interface in `src/renderer/utils/forges/`. No forge-specific branching outside the adapter module.
- **Designated maintainer:** every forge has at least one named maintainer in [`MAINTAINERS.md`](./MAINTAINERS.md) who owns triage and CI for that adapter.
- **Capability-honest UI:** features unsupported by a forge (e.g. mark-as-done) must hide gracefully, not silently no-op.
- **No core-platform churn:** Octicons, Octokit, and the Primer Design System remain in place. Octokit is scoped to the GitHub adapter; other adapters use plain `fetch`.

Currently supported forges: **GitHub** (Cloud, Enterprise Server, Enterprise Cloud with Data Residency), **Gitea** (incl. Forgejo, Codeberg), **Bitbucket Cloud** and **GitLab** (Cloud and Self-Managed).

#### 🚫 Things we won't do

- Operating-system level features
  - Do not disturb, including on schedules. https://github.com/gitify-app/gitify/issues/416#issuecomment-1746480130
  - Persistent notifications like https://github.com/gitify-app/gitify/issues/281. e.g. macOS has Alerts, instead of Banners, which makes them persistent
- Seeing past notifications. This is a tool for monitoring new notifications, not seeing old ones, which can be seen at https://github.com/notifications.
- Specific UX/UI changes that add options and/or visual complexity for minor workflow improvements. e.g. https://github.com/gitify-app/gitify/issues/358, https://github.com/gitify-app/gitify/issues/411 and https://github.com/gitify-app/gitify/issues/979
- UI for something that isn't core to Gitify, and/or can be trivially done another way. e.g. https://github.com/gitify-app/gitify/issues/476 and https://github.com/gitify-app/gitify/issues/221
- Add a forge adapter without a designated maintainer who will own it long-term.

<!-- LINK LABELS -->

[vite-plus-website]: https://viteplus.dev/
[tsdoc-website]: https://tsdoc.org/
[conventional-commits]: https://www.conventionalcommits.org
[release-please]: https://github.com/googleapis/release-please
[github-dependency-dashboard]: https://github.com/gitify-app/gitify/issues/576
[github-issues]: https://github.com/setchy/gitify/issues
[github-milestones]: https://github.com/gitify-app/gitify/milestones
[github-new-release]: https://github.com/gitify-app/gitify/releases/new
[github-octicons]: https://primer.style/foundations/icons
[homebrew-cask-autobump-workflow]: https://github.com/Homebrew/homebrew-cask/actions/workflows/autobump.yml
[vitest-website]: https://vitest.dev/
[i18next-website]: https://www.i18next.com/
[i18n-ally-website]: https://i18n-docs.intlify.org/
