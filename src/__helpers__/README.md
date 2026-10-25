# Test helpers

## `src/__helpers__/`

Shared by Vitest projects and environments:

- `electron-log.setup.ts` — quiets expected error-path logging.
- `restore-test-spies.setup.ts` — restores spies created inside a test.
- `fail-on-act-warnings.setup.ts` — fails tests on React `act(...)` warnings.
- `gitify-bridge.ts` — factory for the mocked `window.gitify` preload bridge.

## `src/renderer/__helpers__/`

Renderer-specific test utilities:

- `test-utils.tsx` — `renderWithProviders` and the shared navigation mock.
- `hook-mocks.ts` — app-level hook stubs.
- `vitest.setup.ts` — renderer unit-test setup.
- `visual-utils.tsx`, `visual.setup.ts`, `visual.global-setup.ts` — browser screenshot harness.
