import '@testing-library/jest-dom/vitest';
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
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
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

  return String(input);
}

function createGitifyBridgeApi(): Window['gitify'] {
  return {
    app: {
      version: vi.fn().mockResolvedValue('v0.0.1'),
      hide: vi.fn(),
      quit: vi.fn(),
      show: vi.fn(),
    },
    twemojiDirectory: vi.fn().mockResolvedValue('/mock/images/assets'),
    openExternalLink: vi.fn(),
    decryptValue: vi.fn().mockResolvedValue({ token: 'decrypted' }),
    encryptValue: vi.fn().mockResolvedValue('encrypted'),
    platform: {
      isLinux: vi.fn().mockReturnValue(false),
      isMacOS: vi.fn().mockReturnValue(true),
      isWindows: vi.fn().mockReturnValue(false),
    },
    zoom: {
      getLevel: vi.fn(),
      setLevel: vi.fn(),
    },
    tray: {
      updateColor: vi.fn(),
      updateTitle: vi.fn(),
      useAlternateIdleIcon: vi.fn(),
      useUnreadActiveIcon: vi.fn(),
    },
    notificationSoundPath: vi.fn(),
    onAuthCallback: vi.fn(),
    onResetApp: vi.fn(),
    onSystemWake: vi.fn(),
    setAutoLaunch: vi.fn(),
    setKeepWindowOnBlur: vi.fn(),
    applyKeyboardShortcut: vi.fn().mockResolvedValue({ success: true }),
    raiseNativeNotification: vi.fn(),
  };
}

window.gitify = createGitifyBridgeApi();

/**
 * Reset stores
 */
beforeEach(() => {
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

  const { useShortcutRegistrationStore } = await import('../hooks/useShortcutRegistration');
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
