import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'node:util';

/**
 * Prevent the following errors with jest:
 * - ReferenceError: TextEncoder is not defined
 * - ReferenceError: TextDecoder is not defined
 */
if (!('TextEncoder' in globalThis)) {
  (globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder =
    TextEncoder;
}
if (!('TextDecoder' in globalThis)) {
  (globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder =
    TextDecoder;
}

// Mock OAuth client ID and secret
process.env.OAUTH_CLIENT_ID = 'FAKE_CLIENT_ID_123';
process.env.OAUTH_CLIENT_SECRET = 'FAKE_CLIENT_SECRET_123';

/**
 * Primer Setup
 */
if (typeof CSS === 'undefined') {
  global.CSS = {} as typeof CSS;
}

if (!CSS.supports) {
  CSS.supports = () => true;
}

// @ts-expect-error
window.Audio = class Audio {
  play() {}
};

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
    updateIcon: jest.fn(),
    updateTitle: jest.fn(),
    useAlternateIdleIcon: jest.fn(),
  },
  notificationSoundPath: jest.fn(),
  onAuthCallback: jest.fn(),
  onResetApp: jest.fn(),
  onSystemThemeUpdate: jest.fn(),
  setAutoLaunch: jest.fn(),
  setKeyboardShortcut: jest.fn(),
  raiseNativeNotification: jest.fn(),
};
