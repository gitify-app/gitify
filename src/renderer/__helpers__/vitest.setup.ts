import '@testing-library/jest-dom/vitest';

// Sets timezone to UTC for consistent date/time in tests and snapshots
process.env.TZ = 'UTC';

// Mock OAuth client ID and secret
process.env.OAUTH_CLIENT_ID = 'FAKE_CLIENT_ID_123';

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

// Mock `showPopover` used by Primer React TooltipV2
if (!('showPopover' in HTMLElement.prototype)) {
  (HTMLElement.prototype as any).showPopover = vi.fn();
}

// Mock `hidePopover` used by Primer React TooltipV2
if (!('hidePopover' in HTMLElement.prototype)) {
  (HTMLElement.prototype as any).hidePopover = vi.fn();
}
