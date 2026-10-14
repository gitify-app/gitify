# Architecture

Gitify is an Electron menubar app that monitors notifications across supported Git forges. This document describes how the code is organised so the structure stays coherent as the app grows. It is the reference for where new code belongs.

## Processes

Gitify runs as three Electron processes plus a small shared module:

| Location        | Role                                                                             |
| --------------- | -------------------------------------------------------------------------------- |
| `src/main/`     | Electron main process: window/menubar lifecycle, tray, handlers, updater         |
| `src/preload/`  | The only bridge between renderer and main, exposed as a typed `window.gitify`    |
| `src/shared/`   | Code imported by **both** processes (constants, events, logger, platform, theme) |
| `src/renderer/` | The React application                                                            |

The renderer never reaches into the main process directly: it goes through `window.gitify`. A capability that requires Node or Electron APIs belongs in the main process behind an IPC handler.

## Renderer layers

The renderer is layered. **Runtime imports flow in one direction only** — a module may import from its own layer or any layer below it, never above.

```
  constants / icons               (leaf: values, presentational icons)
        |
   +----+----+
   |         |
 utils     stores                 peer domain layers
(domain   (client state,
 logic)    Zustand)
   |         |
   +----+----+
        |
      hooks                       orchestration over stores, query, and utils
        |
    components                    presentational React components
        |
      routes                      screens
        |
   App.tsx / index.tsx            composition root - may import any layer
```

- `utils/` is split by concern: `api`, `auth`, `core`, `forges`, `notifications`, `system`, `ui`.
- `types.ts` contains shared renderer types. Its type-only imports from `utils/auth/types` and generated GitHub GraphQL types are an intentional exception to the layer direction; the module has no runtime dependency on those layers.
- `stores/` holds client state (Zustand): persisted `accounts` and `settings`, session `filters` and notification action failures.
- `icons/` holds presentational icon components (brand marks and UI glyphs). It is a **leaf**, below `utils`, so both `utils` and `components` may import it — e.g. a forge adapter declares its brand mark from here.
- `utils` and `stores` are **peers** — they may reference each other. Neither may import `hooks`, `components`, or `routes`.
- `components/` is grouped by feature (`notifications`, `filters`, `settings`, `login`, `fields`, `avatars`, `layout`, `metrics`, `primitives`).
- The composition root (`App.tsx`, `index.tsx`) is the only place allowed to wire every layer together.

## State ownership

Every kind of renderer state has exactly one owner. Put new state with the mechanism that owns its kind:

| Kind of state          | Owner                                                | Examples                                                 |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Server / async data    | TanStack Query                                       | the notification list, periodic account refreshes        |
| Persisted client state | Zustand with `persist`                               | `accounts`, `settings`                                   |
| Session client state   | Zustand without `persist`                            | `filters`, notification action failures                  |
| Derived values         | A store selector/action, or a pure `utils/` function | `isLoggedIn`, `hasMultipleAccounts`, notification status |
| Ephemeral view state   | React `useState` / `useMemo`                         | row expand/collapse, exit animations                     |

Rules:

- **Application state is never owned by a React context.** `AppContext` was retired in favour of hooks and stores; do not reintroduce a context provider to hold app state.
- **Derived values are not stored.** If a value can be computed from existing state, expose it as a selector or a pure function instead of adding new state. Derived predicates are read reactively (invoke the store accessor inside the selector) so consumers update when their source changes.
- Query state is server state: never mirror it into a store.

## Side-effect ownership

App-level side effects are owned by a single host. `GlobalEffects` mounts exactly once (inside the query and theme providers) and owns theme application, tray updates, global shortcut registration, periodic account refreshes, and notification polling and alerts.

Consumers read the shared query cache and stores, and **do not register their own** polling, alerts, wake, or focus listeners. This keeps background work (for example, firing one poll per interval) from multiplying with the number of mounted components. When you add a new background effect, add it to the host, not to a leaf component.

## Forge adapters

Multi-forge support is adapter-based. Each forge implements the `ForgeAdapter` interface in `src/renderer/utils/forges/`, and shared code routes through `getAdapter(forge)` (forge-wide members) or `getAccountAdapter(account)` (account-scoped operations). Shared code never imports forge-specific modules directly, and there is no forge-specific branching outside an adapter module. See `CONTRIBUTING.md` for the conditions for adding a forge.

## Enforcement

The one-way module dependency direction is checked automatically: `vite.config.mts` defines per-layer `no-restricted-imports` overrides for the renderer, and `pnpm check` fails on a violation. The enforced rules are: `utils` and `stores` must not import `hooks`, `components`, or `routes`; `hooks` must not import `components` or `routes`; and `components` must not import `routes`. Any future exception must be argued and documented here rather than silently allow-listed.
