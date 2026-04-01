/**
 * Minimal DOM-globals setup for renderer .ts test files that run in the node project
 * but opt into a DOM environment via `// @vitest-environment happy-dom`.
 *
 * This file is added to the node project's `setupFiles` so that it runs for
 * every test in that project. The `typeof window !== 'undefined'` guard makes
 * it a no-op for tests that stay in the real node environment, while tests
 * that declare `// @vitest-environment happy-dom` at the top of their file
 * get the full `window.gitify` context bridge mock they need.
 */

if (typeof window !== 'undefined') {
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
    applyKeyboardShortcut: vi.fn().mockResolvedValue({ success: true }),
    raiseNativeNotification: vi.fn(),
  };

  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    configurable: true,
  });
}
