import '@testing-library/jest-dom';

/**
 * Primer React testing helpers (per docs)
 * - https://primer.style/product/getting-started/react/#testing
 * - https://github.com/primer/react/blob/main/packages/react/src/utils/test-helpers.tsx
 */
import '@primer/react/test-helpers';

/**
 * Gitify context bridge API
 */
window.gitify = {
  app: {
    version: jest.fn().mockResolvedValue('v0.0.1'),
    hide: jest.fn(),
    quit: jest.fn(),
    show: jest.fn(),
  },
  twemojiDirectory: jest.fn().mockResolvedValue('/mock/images/assets'),
  openExternalLink: jest.fn(),
  decryptValue: jest.fn().mockResolvedValue('decrypted'),
  encryptValue: jest.fn().mockResolvedValue('encrypted'),
  platform: {
    isLinux: jest.fn().mockReturnValue(false),
    isMacOS: jest.fn().mockReturnValue(true),
    isWindows: jest.fn().mockReturnValue(false),
  },
  zoom: {
    getLevel: jest.fn(),
    setLevel: jest.fn(),
  },
  tray: {
    updateColor: jest.fn(),
    updateTitle: jest.fn(),
    useAlternateIdleIcon: jest.fn(),
    useUnreadActiveIcon: jest.fn(),
  },
  notificationSoundPath: jest.fn(),
  onAuthCallback: jest.fn(),
  onResetApp: jest.fn(),
  onSystemThemeUpdate: jest.fn(),
  setAutoLaunch: jest.fn(),
  setKeyboardShortcut: jest.fn(),
  raiseNativeNotification: jest.fn(),
};

globalThis.HTMLMediaElement.prototype.play = jest.fn();

globalThis.matchMedia = (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {}, // deprecated
  removeListener: () => {}, // deprecated
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});
