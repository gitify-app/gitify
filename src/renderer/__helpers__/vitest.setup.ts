import '@testing-library/jest-dom/vitest';
// Initialize the real i18n instance so tests render the English defaults.
import '../i18n';
import { createGitifyBridgeApi } from '../../__helpers__/gitify-bridge';

import { Constants } from '../constants';

// Import store modules directly (not the stores barrel) to keep this setup
// file's import graph light. The accounts store pulls in the forge adapter
// graph, so it is loaded lazily in beforeEach (after each test file's
// vi.mock registrations) to avoid pre-caching unmocked forge modules.
import useFiltersStore from '../stores/useFiltersStore';
import useSettingsStore from '../stores/useSettingsStore';

/**
 * Shared navigate mock — import from test-utils in any test that needs to assert on navigation
 */
export const navigateMock = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => navigateMock,
}));

// Ensure stability in EmojiSplash component snapshots
vi.mock('../utils/core/random', () => ({
  randomElement: vi.fn((arr: unknown[]) => arr[0]),
}));

/**
 * Globally mock the app-level hooks so component tests can inject state via
 * `renderWithProviders` options (see hook-mocks.ts). Hook test files that
 * exercise the real implementations opt out with `vi.unmock(...)`.
 */
vi.mock('../hooks/useNotifications', async () => {
  const actual = await vi.importActual<typeof import('../hooks/useNotifications')>(
    '../hooks/useNotifications',
  );
  const { getMockedNotificationsState } = await import('./hook-mocks');
  return {
    ...actual,
    useNotifications: () => getMockedNotificationsState(),
  };
});

vi.mock('../hooks/notifications/useNotificationActions', async () => {
  const actual = await vi.importActual<
    typeof import('../hooks/notifications/useNotificationActions')
  >('../hooks/notifications/useNotificationActions');
  const { getMockedNotificationActionsState } = await import('./hook-mocks');
  return {
    ...actual,
    useNotificationActions: () => getMockedNotificationActionsState(),
  };
});

vi.mock('../hooks/notifications/useNotificationsHost', async () => {
  const actual = await vi.importActual<
    typeof import('../hooks/notifications/useNotificationsHost')
  >('../hooks/notifications/useNotificationsHost');
  const { getMockedNotificationsState } = await import('./hook-mocks');
  return {
    ...actual,
    useNotificationsHost: () => getMockedNotificationsState(),
  };
});

vi.mock('../hooks/useLogins', async () => {
  const actual = await vi.importActual<typeof import('../hooks/useLogins')>('../hooks/useLogins');
  const { getMockedLoginsState } = await import('./hook-mocks');
  return {
    ...actual,
    useLogins: () => getMockedLoginsState(),
  };
});

vi.mock('../hooks/useOnlineStatus', async () => {
  const actual = await vi.importActual<typeof import('../hooks/useOnlineStatus')>(
    '../hooks/useOnlineStatus',
  );
  const { getMockedIsOnline } = await import('./hook-mocks');
  return {
    ...actual,
    useOnlineStatus: () => getMockedIsOnline(),
  };
});

function getRequestTarget(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.href;
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.url;
  }

  return (input as Request).url;
}

window.gitify = createGitifyBridgeApi();

/**
 * Pin the browser language so i18n detection is deterministic in tests
 * regardless of the machine/CI locale.
 */
Object.defineProperty(navigator, 'language', {
  value: 'en',
  configurable: true,
});

/**
 * Reset stores
 */
beforeEach(() => {
  // Clear any language preference so each test detects/serves English
  localStorage.removeItem(Constants.STORAGE.LANGUAGE);

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      throw new Error(
        `Unexpected network request in test: ${getRequestTarget(input)}. Mock the network boundary explicitly.`,
      );
    }),
  );
  useFiltersStore.getState().reset();
  useSettingsStore.getState().reset();
  navigateMock.mockReset();
  window.gitify = createGitifyBridgeApi();
});

beforeEach(async () => {
  const { default: useAccountsStore } = await import('../stores/useAccountsStore');
  useAccountsStore.getState().reset();

  const { resetHookMocks } = await import('./hook-mocks');
  resetHookMocks();

  const { usePowerStateStore, useShortcutRegistrationStore } = await import('../stores');
  usePowerStateStore.setState({ isActive: true });
  useShortcutRegistrationStore.getState().reset();
});

afterEach(() => {
  vi.useRealTimers();
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  configurable: true,
});

/**
 * Primer React testing helpers
 * Note: @primer/react/test-helpers uses Jest internally, so we provide our own mocks
 * - https://primer.style/product/getting-started/react/#testing
 * - https://github.com/primer/react/blob/main/packages/react/src/utils/test-helpers.tsx
 */

// Mock `showPopover` and `hidePopover` used by Primer React TooltipV2
global.HTMLElement.prototype.showPopover = vi.fn();
global.HTMLElement.prototype.hidePopover = vi.fn();
