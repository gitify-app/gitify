import '@testing-library/jest-dom';

/**
 * Primer React testing helpers (per docs)
 * - https://primer.style/product/getting-started/react/#testing
 * - https://github.com/primer/react/blob/main/packages/react/src/utils/test-helpers.tsx
 */
import '@primer/react/test-helpers';

/**
 * Custom snapshot serializer to normalize React auto-generated IDs.
 * This makes snapshots stable regardless of test execution order.
 * React's useId() generates IDs like "_r_X_" where X changes based on
 * how many components have rendered before.
 */
expect.addSnapshotSerializer({
  test: (val) => typeof val === 'string' && /_r_[a-z0-9]+_/.test(val),
  serialize: (val: string) => {
    return `"${val.replace(/_r_[a-z0-9]+_/g, '_r_ID_')}"`;
  },
});

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
