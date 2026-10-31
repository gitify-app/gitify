import { vi } from 'vitest';

export type TestPlatform = 'linux' | 'macos' | 'windows';

/**
 * Create the `window.gitify` preload bridge used by renderer tests.
 *
 * The real bridge is platform-specific; tests pick a platform so platform
 * branches (Tray on macOS, X11 on Linux) render deterministically.
 */
export function createGitifyBridgeApi(platform: TestPlatform = 'macos'): Window['gitify'] {
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
    githubCliToken: vi.fn().mockResolvedValue({ token: 'gh-cli-token' }),
    setWindowVibrancy: vi.fn().mockResolvedValue(undefined),
    setNativeTheme: vi.fn().mockResolvedValue(undefined),
    platform: {
      isLinux: vi.fn(() => platform === 'linux'),
      isMacOS: vi.fn(() => platform === 'macos'),
      isWindows: vi.fn(() => platform === 'windows'),
    },
    zoom: {
      getLevel: vi.fn(),
      setLevel: vi.fn(),
    },
    tray: {
      updateColor: vi.fn(),
      updateTitle: vi.fn(),
      setAppearance: vi.fn(),
      useUnreadActiveIcon: vi.fn(),
    },
    notificationSoundPath: vi.fn(),
    onResetApp: vi.fn(() => vi.fn()),
    onSystemWake: vi.fn(() => vi.fn()),
    onZoom: vi.fn(() => vi.fn()),
    setAutoLaunch: vi.fn(),
    setKeepWindowOnBlur: vi.fn(),
    setShowUpdateNotifications: vi.fn(),
    setUseX11Backend: vi.fn(),
    applyKeyboardShortcut: vi.fn().mockResolvedValue({ success: true }),
    nativeNotifications: {
      show: vi.fn().mockResolvedValue({ supported: true }),
      remove: vi.fn(),
      removeAll: vi.fn(),
      notifyReady: vi.fn(),
      isSupported: vi.fn().mockResolvedValue(true),
      onAction: vi.fn(() => vi.fn()),
      onClick: vi.fn(() => vi.fn()),
    },
  };
}
