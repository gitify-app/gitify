import useFiltersStore from '../stores/useFiltersStore';
import useSettingsStore from '../stores/useSettingsStore';

/**
 * Frozen wall clock. `NotificationFooter` renders `<RelativeTime>`, which
 * formats against "now" — without pinning it, every baseline containing a
 * notification expires the moment the phrasing rolls over ("9 years ago" →
 * "10 years ago"). Only `Date` is faked so React's scheduler keeps its real
 * timers.
 */
const FIXED_NOW = new Date('2026-01-02T00:00:00Z');

/**
 * Solid SVG stand-in for images the app would otherwise fetch over the network.
 * Both Primer's `Avatar` and `img.emoji` size their images entirely from CSS,
 * so substituting the source preserves layout.
 */
export function stubImage(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="${color}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Keeps the emoji EmojiSplash picks stable across runs.
vi.mock('../utils/core/random', () => ({
  randomElement: vi.fn((arr: unknown[]) => arr[0]),
}));

// Twemoji SVGs are resolved from the packaged app's asset directory, which the
// browser test server does not serve.
vi.mock('../utils/ui/emojis', () => ({
  convertTextToEmojiImgHtml: vi.fn(
    async (text: string) =>
      `<img alt="${text}" class="emoji" src="${stubImage('#8250df')}" width="16" height="16" />`,
  ),
}));

/**
 * Mirrors the app-level hook mocks in vitest.setup.ts so `renderRoute` can
 * inject notification and login state through the same `hook-mocks` module.
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

/**
 * Reports Linux/Windows rather than macOS, matching the platform the committed
 * baselines are generated on. Glass therefore resolves to its `backdrop-filter`
 * material; the macOS native vibrancy material cannot be captured by Chromium.
 */
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
    setWindowVibrancy: vi.fn().mockResolvedValue(undefined),
    setNativeTheme: vi.fn().mockResolvedValue(undefined),
    platform: {
      isLinux: vi.fn().mockReturnValue(true),
      isMacOS: vi.fn().mockReturnValue(false),
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
    onAuthCallback: vi.fn(() => vi.fn()),
    onResetApp: vi.fn(() => vi.fn()),
    onSystemWake: vi.fn(() => vi.fn()),
    setAutoLaunch: vi.fn(),
    setKeepWindowOnBlur: vi.fn(),
    setShowUpdateNotifications: vi.fn(),
    setUseX11Backend: vi.fn(),
    applyKeyboardShortcut: vi.fn().mockResolvedValue({ success: true }),
    raiseNativeNotification: vi.fn(),
  };
}

/**
 * Settles animations to their end state before anything renders.
 *
 * Playwright freezes CSS animations when it takes the screenshot, but that is
 * too late for the login route: its tab indicator measures tab positions with
 * `getBoundingClientRect` in a layout effect, so a tab still mid-`fade-up`
 * yields a different pill offset every run. Zeroing the durations up front
 * makes that measurement read the settled layout. Every affected animation ends
 * at the element's natural style, so nothing is hidden from the screenshot.
 */
function disableAnimations(): void {
  const style = document.createElement('style');
  style.textContent = `*, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }`;
  document.head.appendChild(style);
}

beforeEach(async () => {
  disableAnimations();
  vi.useFakeTimers({ toFake: ['Date'], now: FIXED_NOW });

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      throw new Error(
        `Unexpected network request in visual test: ${String(input)}. Mock the network boundary explicitly.`,
      );
    }),
  );

  window.gitify = createGitifyBridgeApi();

  useFiltersStore.getState().reset();
  useSettingsStore.getState().reset();

  const { default: useAccountsStore } = await import('../stores/useAccountsStore');
  useAccountsStore.getState().reset();

  const { resetHookMocks } = await import('./hook-mocks');
  resetHookMocks();

  const { useShortcutRegistrationStore } = await import('../hooks/useShortcutRegistration');
  useShortcutRegistrationStore.getState().reset();
});

afterEach(async () => {
  const { cleanup } = await import('@testing-library/react');
  cleanup();
  for (const root of document.querySelectorAll('[data-testid="visual-root"]')) {
    root.remove();
  }
  vi.useRealTimers();
});
