import '@testing-library/jest-dom';

import { TextEncoder } from 'node:util';

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

// Mock OAuth client ID and secret
process.env.OAUTH_CLIENT_ID = 'FAKE_CLIENT_ID_123';
process.env.OAUTH_CLIENT_SECRET = 'FAKE_CLIENT_SECRET_123';

/**
 * Primer (@primer/react) Setup - START
 *
 * Borrowed from https://github.com/primer/react/blob/main/packages/react/src/utils/test-helpers.tsx
 */

// JSDOM doesn't mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => {
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
  };
});

// @ts-expect-error only declare properties used internally
global.CSS = {
  escape: jest.fn(),
  supports: jest.fn().mockImplementation(() => {
    return false;
  }),
};

// prevent ReferenceError: TextEncoder is not defined
global.TextEncoder = TextEncoder;

/**
 * Primer (@primer/react) Setup - END
 */

window.HTMLMediaElement.prototype.play = jest.fn();

window.matchMedia = (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {}, // deprecated
  removeListener: () => {}, // deprecated
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});
