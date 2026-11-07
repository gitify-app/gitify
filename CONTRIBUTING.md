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

On macOS, `pnpm dev` runs from a Gitify-branded copy of the Electron bundle in `~/Library/Caches/gitify-dev`. This keeps native notification activation inside the running development app instead of launching the generic `Electron.app`. The copy lives outside the checkout because Launch Services ignores applications under the temporary directory, and macOS will not deliver notifications from an application the notification daemon cannot resolve. The bundle is recreated when the Electron version or signing identity changes, and it is registered with Launch Services on every launch. It is signed with a Developer ID or Apple Development identity when available, falling back to ad-hoc signing. Set `GITIFY_DEV_SIGN_IDENTITY` to choose a specific identity.

### 🛠️ Tests

Tooling is unified through [Vite+][vite-plus-website], which bundles the linter (oxlint), formatter (oxfmt), test runner (Vitest), and dev/build pipeline (Vite).

```shell
# Run lint, format, and type checks
pnpm check

# CI lint with GitHub annotations
pnpm lint:ci

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

### 🔔 Native notification checks

Operating-system notifications are created in the main process. A single unread notification offers a **Mark as read** action; multiple new notifications publish one count-only summary with no action.

A single notification uses the repository as its title, `Reason · @actor` as context, and the formatted display title as its body. macOS shows the context as the subtitle; Windows and Linux fold it into the body above the subject.

- **macOS**: native notifications require a code-signed app. Electron ships ad-hoc linker-signed, which macOS rejects for `UNUserNotificationCenter`, so `pnpm dev` re-signs the development Electron bundle automatically. Ad-hoc signing needs no certificate; set `GITIFY_DEV_SIGN_IDENTITY` to use a Developer ID or Apple Development identity. The same step sets `NSUserNotificationAlertStyle: alert`; the packaged app declares it in its `Info.plist`.
- **Windows**: live interactions use the notification instance events.
- **Linux**: the action button appears only when the desktop notification server advertises the `actions` capability.

Verify the notification content, body click, Mark as read, removal-on-read, and summary click on the platforms you change.

### 📦 Dependencies and packaging

The packaged app ships only the packages that are loaded from disk at runtime.
Declare main-process runtime dependencies in `dependencies`; packages that Vite
bundles into the renderer belong in `devDependencies`, even though the renderer
imports them. The current runtime packages are `electron-log`,
`electron-menubar`, and `electron-updater`. React and `cn` are bundled into the
renderer; i18next is bundled into both main and renderer, while its React adapter
and CLI are renderer/build tooling. Bundled packages remain in `devDependencies`.

`electron-builder` collects the production closure from `dependencies` through
its pnpm collector. Do not add `node_modules` to the `files` list in
`electron-builder.js` — a hand-written glob overrides that collector and can
re-introduce dev dependencies. After packaging, run
`node scripts/verifyPackagedDependencies.js <app path>` to assert that the asar
contains the runtime packages and none of the renderer-only packages or the pnpm
virtual store.

`pnpm build` also enforces this: the main-process external list is derived from
`dependencies`, and the build fails when a runtime dependency is never imported
by the main or preload process.

### Translations

Gitify's interface is translated through [i18next][i18next-website]. The app ships English as the only locale today, but the infrastructure supports additional languages — adding one is a contributor-friendly change.

- Renderer translations live in `src/renderer/i18n/locales/<language>.json`; native UI translations (`native:` keys) live in `src/shared/i18n/locales/<language>/native.json`. Main and renderer use separate i18next instances and load only their own resources.
- English resources are generated from the code, never hand-edited. Write the English text as the second argument of `t()`, and as `defaults` on `<Trans>`:

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
  - `pnpm i18n:check` — verify the keys are in sync with the code, every renderer/main `t()`/`<Trans>` has an English default, and English resources have no empty or key-path values (also runs in CI)
  - `pnpm i18n:lint` — flag hardcoded or untranslated UI strings
  - `pnpm i18n:status` — locale health summary
- Don't run `i18next-cli extract --trust-derived`: it replaces real English text with key names.
- To add a language:
  1. Copy the English resources to `src/renderer/i18n/locales/<lang>.json` and `src/shared/i18n/locales/<lang>/native.json`.
  2. Add it to `SUPPORTED_LANGUAGES` in `src/shared/i18n/types.ts` and `LANGUAGE_LABELS` in `src/renderer/i18n/types.ts` (this surfaces it in the Appearance → Language selector).
  3. Import the renderer resource in `src/renderer/i18n/loader.ts` and the native resource in `src/main/language.ts`.
  4. Translate the keys. The [i18n Ally][i18n-ally-website] VSCode configuration covers renderer resources; edit native resources as JSON and validate them with the same checks.
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

#### 🔒 Packaged build hardening

Packaged builds pin Electron's [fuses][electron-fuses] in `electron-builder.js`, so a shipped binary refuses the framework's permissive defaults. electron-builder flips them after packing and before signing, so the code signature covers the flipped binary.

| Fuse                                    | Value | Effect                                                                 |
| --------------------------------------- | ----- | ---------------------------------------------------------------------- |
| `runAsNode`                             | off   | refuses `ELECTRON_RUN_AS_NODE`, so the binary cannot run as plain Node |
| `enableNodeOptionsEnvironmentVariable`  | off   | ignores `NODE_OPTIONS` and `NODE_EXTRA_CA_CERTS`                       |
| `enableNodeCliInspectArguments`         | off   | refuses `--inspect` and `SIGUSR1`                                      |
| `enableEmbeddedAsarIntegrityValidation` | on    | validates `app.asar` before loading it                                 |
| `onlyLoadAppFromAsar`                   | on    | no fallback to an adjacent `app/` directory                            |

`electronFuses` also sets `resetAdHocDarwinSignature`, which is not a fuse. Flipping the fuses invalidates the ad-hoc signature Electron ships with, and Apple Silicon refuses to launch a binary whose signature no longer validates. The build workflow packages macOS unsigned (`-c.mac.identity=null`), so without it the arm64 artifact is killed on launch. Signed builds re-sign afterwards, superseding the ad-hoc signature.

Four settings are deliberate non-choices:

- **`enableCookieEncryption` stays at its Electron default.** Tokens are already encrypted through `safeStorage`, and Gitify keeps no cookies worth protecting. Electron also documents the fuse as one-way: disabling it later loses the cookie store.
- **`grantFileProtocolExtraPrivileges` stays at its Electron default.** The renderer loads `index.html` over `file://`, so removing those privileges breaks asset and sound loading.
- **`asar` must stay enabled.** `onlyLoadAppFromAsar` requires it, and packaging without an archive fails rather than producing an artifact that cannot start.
- **Asar integrity is not required on Linux.** Electron does not support it there, so the fuse is inert.

`scripts/verifyFuses.js` reads the fuse wire back out of the built artifacts and fails when it does not match the expected posture. The expected set is a constant in that script rather than read from this configuration, so removing the configuration fails the build instead of passing vacuously. The build and publish workflows run it after packaging, because a missing `electronFuses` block is otherwise a silent no-op: electron-builder simply leaves the Electron defaults in place.

#### 🔄 Updates for packaged installations

Gitify updates itself by default. Automatic updates default to off only where a package manager owns updates: Scoop (detected from its installation metadata), Flatpak, and Snap.

Package maintainers can select the same default by placing an empty `disable-auto-updates` file in the application's resources directory (Electron's `process.resourcesPath`) or by setting `GITIFY_DISABLE_AUTO_UPDATE=1` in the launcher. Packages that run on a system Electron should use the environment variable.

Users can override the default under Settings > System > Automatic updates, and the choice persists across restarts. Turning updates off stops scheduled checks, cancels active downloads, and prevents installation on quit. The tray menu then offers **View releases** instead of **Check for updates**.

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
[electron-fuses]: https://www.electronjs.org/docs/latest/tutorial/fuses
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
