import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';

// Sets timezone to UTC for consistent date/time in tests and snapshots
process.env.TZ = 'UTC';

/**
 * Primer React testing helpers
 * Note: @primer/react/test-helpers uses Jest internally, so we provide our own mocks
 */

// Mock window.matchMedia for Primer React components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
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
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
(globalThis as Record<string, unknown>).IntersectionObserver =
  MockIntersectionObserver;

/**
 * Mock Tauri internals - set to empty object so window.gitify works
 */
(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {};

/**
 * Gitify context bridge API
 */
(window as unknown as Record<string, unknown>).gitify = {
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
  exchangeOAuthCode: vi.fn().mockResolvedValue('mock-access-token'),
  exchangeGitHubAppCode: vi.fn().mockResolvedValue('mock-github-app-token'),
  getGitHubAppClientId: vi.fn().mockResolvedValue('FAKE_CLIENT_ID_123'),
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
  onAuthCallback: vi.fn().mockResolvedValue(() => {}),
  onResetApp: vi.fn().mockResolvedValue(() => {}),
  onSystemThemeUpdate: vi.fn().mockResolvedValue(() => {}),
  setAutoLaunch: vi.fn(),
  setKeyboardShortcut: vi.fn(),
  raiseNativeNotification: vi.fn(),
};

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
// jsdom doesn't support adoptedStyleSheets, so we need to mock it
Object.defineProperty(document, 'adoptedStyleSheets', {
  value: [],
  writable: true,
  configurable: true,
});

// Mock ShadowRoot adoptedStyleSheets for web components
const originalAttachShadow = Element.prototype.attachShadow;
Element.prototype.attachShadow = function (init: ShadowRootInit): ShadowRoot {
  const shadowRoot = originalAttachShadow.call(this, init);
  Object.defineProperty(shadowRoot, 'adoptedStyleSheets', {
    value: [],
    writable: true,
    configurable: true,
  });
  return shadowRoot;
};
