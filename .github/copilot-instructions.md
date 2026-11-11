# Gitify Development Instructions

Gitify is an Electron menubar app that shows notifications from GitHub, Gitea, Bitbucket Cloud, and GitLab. Read [ARCHITECTURE.md](../ARCHITECTURE.md) for where code belongs and [CONTRIBUTING.md](../CONTRIBUTING.md) for the full development guide.

## Setup

Install the [Vite+ CLI](https://viteplus.dev/guide/global-cli) (`vp`), then run `vp install`. It downloads the pnpm version pinned in `package.json`.

## Commands

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `vp run dev`        | Dev server, GraphQL codegen watcher, and Electron        |
| `vp run build`      | Production build into `build/`                           |
| `vp run check`      | Format, lint, and type checks                            |
| `vp run check:fix`  | Same checks, fixing what can be fixed automatically      |
| `vp run test`       | Vitest suite with coverage; add `-u` to update snapshots |
| `vp run i18n:check` | Locale keys and English defaults are in sync             |

Before finishing a change, run `vp run check` and `vp run test`, and `vp run i18n:check` when you touch user-visible strings.

## Gotchas

- Electron cannot start in headless or container environments, so `vp run dev` fails there. Validate with checks and tests instead of fixing the launch.
- GraphQL types are generated into `src/renderer/utils/forges/*/graphql/generated/` and committed. Regenerating the GitHub schema needs a `GITHUB_TOKEN` in `.env` (see `.env.template`).

## Project Philosophy

This is a notification _viewer_, not a full forge client. Keep changes:

- **Focused** on the notification surface. Don't expand scope into full forge feature parity.
- **Forge-agnostic** at the orchestration layer. New forge behaviour belongs in the forge adapter (`src/renderer/utils/forges/<forge>/adapter.ts`), not in shared hooks or components.
- **Minimal**. Avoid adding complexity for edge cases.
- **Cross-platform** (macOS, Windows, Linux).
