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

The renderer is layered. **Runtime imports flow in one direction only** — a module may import from its own layer or any layer below it, never above. Type-only imports are exempt: importing types never creates a runtime dependency, so it need not follow the direction.

```
  types / constants / icons       (leaf: shared types, values, presentational icons)
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
   App.tsx / router.tsx / index.tsx   composition root - may import any layer
```

- `utils/` is split by concern: `api`, `auth`, `core`, `forges`, `notifications`, `system`, `ui`.
- `types.ts`, `constants.ts`, and `icons/` are the leaf modules: shared types, shared values, and presentational icons. `types.ts` imports types from `utils/auth/types` and generated GitHub GraphQL types — those imports are type-only, so the direction rule does not apply. `icons/` sits below `utils`, so both `utils` and `components` may import it (a forge adapter declares its brand mark from here).
- `stores/` holds client state (Zustand): persisted `accounts` and `settings`, session `filters`, notification action failures, and power state.
- `stores/index.ts` is the public store facade for `hooks`, `components`, and `routes`. Lower layers (`utils`) import the specific store module instead (for example `stores/useFiltersStore`): the barrel re-exports every store and its dependencies, which would pull the account/auth/forge graph into leaf utilities and create cycles.
- `utils` and `stores` are **peers** — they may reference each other. Neither may import `hooks`, `components`, or `routes`.
- `components/` is grouped by feature (`notifications`, `filters`, `settings`, `login`, `avatars`, `layout`, `metrics`, `primitives`).
- The composition root (`App.tsx`, `router.tsx`, `index.tsx`) is the only place allowed to wire every layer together.
- `router.tsx` owns the single route table and creates the hash data router. A root layout route renders the window chrome, global shortcuts, and sidebar around an `<Outlet />`; a nested protected layout route owns the login redirect for every authenticated screen. Destinations shared with the sidebar and shortcuts live in `nav.ts`.

## State ownership

Every kind of renderer state has exactly one owner. Put new state with the mechanism that owns its kind:

| Kind of state          | Owner                                                | Examples                                                 |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Server / async data    | TanStack Query                                       | the notification list, periodic account refreshes        |
| Persisted client state | Zustand with `persist`                               | `accounts`, `settings`                                   |
| Session client state   | Zustand without `persist`                            | `filters`, notification action failures, power state     |
| Derived values         | A store selector/action, or a pure `utils/` function | `isLoggedIn`, `hasMultipleAccounts`, notification status |
| Ephemeral view state   | React `useState` / `useMemo`                         | row expand/collapse, exit animations                     |

Rules:

- **Application state is never owned by a React context.** `AppContext` was retired in favour of hooks and stores; do not reintroduce a context provider to hold app state.
- **Derived values are not stored.** If a value can be computed from existing state, expose it as a selector or a pure function instead of adding new state. Derived predicates are read reactively (invoke the store accessor inside the selector) so consumers update when their source changes.
- Query state is server state: never mirror it into a store.

## Side-effect ownership

App-level side effects are owned by a single host. `GlobalEffects` mounts exactly once (inside the query and theme providers) and owns theme application, tray updates, global shortcut registration, periodic account refreshes, and notification polling and alerts. It also subscribes to system sleep and wake events so notification and account polling pause while the machine is locked or suspended (`SYSTEM_SLEEP`) and resume with an immediate refetch on unlock or resume (`SYSTEM_WAKE`). Hidden-window polling and the online/offline pause are unchanged.

Consumers read the shared query cache and stores, and **do not register their own** polling, alerts, wake, or focus listeners. This keeps background work (for example, firing one poll per interval) from multiplying with the number of mounted components. When you add a new background effect, add it to the host, not to a leaf component.

Operating-system notifications are created by the main process behind the typed `window.gitify.nativeNotifications` bridge. The single notification host publishes the filtered new-notification set, marks a notification read when its OS action is used, opens the target when a body is clicked, and removes published notifications when they become read or leave the unfiltered cache. The sandboxed preload only forwards requests and listeners; it never constructs an OS notification.

Subscription is separate from side effects, but it multiplies the same way: every TanStack Query observer re-runs the query's `select` and structural-sharing walk whenever the cached data changes. A component that renders once per notification — the notification row, the repository header — must therefore not subscribe. It obtains notification actions (mark as read/done, unsubscribe, remove an account, refetch) with `useNotificationActions`, which never calls `useQuery`. Components that read notification data use `useNotifications` and stay subscribed by design.

## Forge adapters

Multi-forge support is adapter-based. Each forge implements the `ForgeAdapter` interface in `src/renderer/utils/forges/`, and shared code routes through `getAdapter(forge)` (forge-wide members) or `getAccountAdapter(account)` (account-scoped operations). Shared code never imports forge-specific modules directly, and there is no forge-specific branching outside an adapter module. See `CONTRIBUTING.md` for the conditions for adding a forge.

## Enforcement

The one-way module dependency direction is checked automatically: `vite.config.mts` defines per-layer `no-restricted-imports` overrides for the renderer, and `pnpm check` fails on a violation. The enforced rules are: `utils` and `stores` must not import `hooks`, `components`, or `routes`; `utils` must not import the `stores` barrel (it imports the specific store module); `hooks` must not import `components` or `routes`; `components` must not import `routes`; and the leaf layers stay leaves — `icons` must not import any implementation layer, and the leaf modules `types`/`constants` must not import implementation layers either (their type-only imports are permitted). Across processes, the renderer may not import `main`, `preload`, or Electron; `main` and `preload` may not import each other or the renderer; and `shared` may not import any process module or Node builtins. `import/no-cycle` rejects dependency cycles across the renderer, main, preload, and shared code. Any future exception must be argued and documented here rather than silently allow-listed.
