import '@testing-library/jest-dom/vitest';

// Sets timezone to UTC for consistent date/time in tests and snapshots
process.env.TZ = 'UTC';

// Mock OAuth client ID and secret
process.env.OAUTH_CLIENT_ID = 'FAKE_CLIENT_ID_123';

/**
 * Primer React testing helpers
 * Note: @primer/react/test-helpers uses Jest internally, so we provide our own mocks
 * - https://primer.style/product/getting-started/react/#testing
 * - https://github.com/primer/react/blob/main/packages/react/src/utils/test-helpers.tsx
 */

/**
 * Gitify context bridge API
 */
window.gitify = {
  app: {
    version: vi.fn().mockResolvedValue('v0.0.1'),
    hide: vi.fn(),
    quit: vi.fn(),
    show: vi.fn(),
  },
  twemojiDirectory: vi.fn().mockResolvedValue('/mock/images/assets'),
  openExternalLink: vi.fn(),
  decryptValue: vi.fn().mockResolvedValue('decrypted'),
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
  onSystemThemeUpdate: vi.fn(),
  setAutoLaunch: vi.fn(),
  setKeyboardShortcut: vi.fn(),
  raiseNativeNotification: vi.fn(),
};

// prevent ReferenceError: TextEncoder is not defined
// window.TextEncoder = TextEncoder;

window.HTMLMediaElement.prototype.play = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for Primer React components
// class MockIntersectionObserver {
//   observe = vi.fn();
//   unobserve = vi.fn();
//   disconnect = vi.fn();
// }
// (globalThis as Record<string, unknown>).IntersectionObserver =
//   MockIntersectionObserver;

// Mock HTMLMediaElement.play - must return a Promise
globalThis.HTMLMediaElement.prototype.play = vi
  .fn()
  .mockResolvedValue(undefined);

// Mock ResizeObserver as a class (must be a constructor)
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = MockResizeObserver;

// Mock adoptedStyleSheets for Primer React components
// // jsdom doesn't support adoptedStyleSheets, so we need to mock it
// Object.defineProperty(document, 'adoptedStyleSheets', {
//   value: [],
//   writable: true,
//   configurable: true,
// });

// Mock ShadowRoot adoptedStyleSheets for web components
// const originalAttachShadow = Element.prototype.attachShadow;
// Element.prototype.attachShadow = function (init: ShadowRootInit): ShadowRoot {
//   const shadowRoot = originalAttachShadow.call(this, init);
//   Object.defineProperty(shadowRoot, 'adoptedStyleSheets', {
//     value: [],
//     writable: true,
//     configurable: true,
//   });
//   return shadowRoot;
// };

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  configurable: true,
});
