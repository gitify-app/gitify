# Gitify Development Instructions

Gitify is a multi-forge notification client — an Electron desktop app that surfaces GitHub, Gitea, and Bitbucket Cloud notifications in the system tray. Built with React, TypeScript, Vite, and pnpm.

**ALWAYS follow these instructions first and only fallback to additional search and context gathering if the information in the instructions is incomplete or found to be in error.**

## Prerequisites and Setup

- **Node.js**: `>=24` (`.nvmrc` pins `24.18.0`). Use `nvm use` to activate the right version.
- **Install pnpm globally**: `npm install -g pnpm`
- **Bootstrap the repository**: `pnpm install` — takes up to a minute on a clean install. NEVER CANCEL. Set timeout to 5+ minutes.

## Key Commands

| Command             | What it does                                                                | Timing        |
| ------------------- | --------------------------------------------------------------------------- | ------------- |
| `pnpm dev`          | Vite dev server + GraphQL codegen watch (main development loop)             | ~10s to start |
| `pnpm build`        | Production build for all Electron targets (main, preload, renderer, shared) | ~30s clean    |
| `pnpm test`         | Run full Vitest suite with coverage                                         | ~15s          |
| `pnpm check`        | oxlint + oxfmt + type-check (unified via vite-plus)                         | <5s           |
| `pnpm check:fix`    | Same as check but auto-fixes formatting and lint                            | <5s           |
| `pnpm tsc --noEmit` | TypeScript-only type-check                                                  | ~5s           |

**NEVER CANCEL long-running commands** (`pnpm install`, `pnpm build`). Set terminal timeouts to 5+ minutes.

## Development Workflow

- **Day-to-day development**: `pnpm dev` — starts both the Vite dev server and GraphQL codegen watcher concurrently. Leave running while developing.
- **Full build**: `pnpm build` — builds all targets via `vp build`. Output goes to `build/` (subdirectories: `main/`, `preload/`, `renderer/`, `shared/`).
- **Run the Electron app**: `pnpm start` — runs `pnpm build` then `pnpm dev`. Will fail in headless/container environments due to Electron sandbox restrictions (this is expected and normal).

## Validation

After making changes, validate in this order:

1. **Type-check**: `pnpm tsc --noEmit` — must complete with no errors
2. **Lint + format**: `pnpm check` — warnings are acceptable, errors are not
3. **Tests**: `pnpm test` — focus on no NEW failures; existing snapshots may differ on timezone-mismatched machines
4. **Build**: `pnpm build` — look for `✓ built in [time]` for each target (main, preload, renderer, shared)

**Snapshot test failures**: Run `pnpm test -u` to regenerate after legitimate UI changes.

**Pre-commit**: Husky runs `vp staged` automatically on `git commit`. Manual equivalent: `pnpm check && pnpm test`.

## File Map

### Source

- `src/main/` — Electron main process (Node.js)
- `src/preload/` — Electron preload scripts
- `src/renderer/` — React UI (the visible app)
- `src/shared/` — Code shared across all processes

### Key renderer paths

- `src/renderer/utils/forges/` — Per-forge adapters (github/, gitea/, bitbucket/) and registry
- `src/renderer/utils/auth/` — Authentication utilities
- `src/renderer/hooks/useNotifications.ts` — Core notification polling logic
- `src/renderer/components/` — UI components
- `src/renderer/routes/` — Page-level route components
- `src/renderer/stores/` — Zustand stores

### Configuration

- `vite.config.ts` — Primary build config; also hosts `lint`, `fmt`, and `staged` blocks used by `pnpm check` and Husky
- `vitest.config.ts` — Test configuration (Vitest projects: happy-dom for renderer/preload, node for main/shared)
- `tsconfig.json` — TypeScript configuration
- `tailwind.config.mts` — Tailwind CSS configuration
- `package.json` — Scripts and dependency versions

### Assets

- `assets/` — Icons, sounds, and static resources

## Local Packaging

Requires a prior `pnpm build` and platform-specific tooling:

- **macOS**: `pnpm package:macos --publish=never`
- **Windows**: `pnpm package:win --publish=never`
- **Linux**: `pnpm package:linux --publish=never`

## Constraints and Gotchas

- **Electron won't start in CI/containers**: Sandbox restrictions make `pnpm start` / `pnpm dev` fail headlessly. This is expected — test logic; don't try to fix the launch.
- **Node version is strict**: `>=24` required. Check `.nvmrc` and run `nvm use` if commands behave oddly.
- **Snapshot drift on non-UTC machines**: Some snapshot tests encode relative dates. Tests may fail locally if your timezone differs from UTC. The test setup stubs `TZ=UTC` via `vi.stubEnv`.
- **Lint warnings are OK**: The codebase has pre-existing lint warnings. Only new errors block CI.
- **GraphQL codegen**: Running `pnpm dev` auto-watches for schema changes. If you edit `.graphql` files manually, re-run `pnpm codegen` to regenerate `graphql/generated/graphql.ts`.

## Development Philosophy

This is a notification _viewer_, not a full forge client. Keep changes:

- **Focused** on the notification surface — don't expand scope into full forge feature parity
- **Forge-agnostic** at the orchestration layer — new forge behaviour belongs in the forge adapter (`src/renderer/utils/forges/<forge>/adapter.ts`), not in shared hooks or components
- **Minimal** — avoid adding complexity for edge cases
- **Cross-platform** (macOS, Windows, Linux)

## Technology Stack

- **Electron 43+** — desktop app host
- **React 19+** — UI
- **TypeScript 5+** — language
- **pnpm 10+** — package manager
- **Vite + vite-plus** — unified build, dev, lint (`oxlint`), format (`oxfmt`), and test toolchain. The `vp` CLI drives all tooling.
- **Vitest** — test runner (via `vp test`); `@testing-library/jest-dom` provides DOM matchers
- **Tailwind CSS v4** — styling
- **Zustand** — client state management
- **TanStack Query** — server state / notification fetching
- **electron-menubar** — system tray integration
- **electron-updater** — auto-update
- **@primer/react** — GitHub's component library (UI primitives)
- **@primer/octicons-react** — icon library
- **octokit** — GitHub API HTTP client (GitHub forge only)
- **date-fns** — date utilities
