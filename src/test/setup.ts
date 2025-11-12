import '@testing-library/jest-dom';

import { vi } from 'vitest';

// Mock electron modules
vi.mock('electron', () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  shell: {
    openExternal: vi.fn(),
  },
  nativeTheme: {
    shouldUseDarkColors: false,
  },
}));

// Mock electron-log
vi.mock('electron-log', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

// Mock menubar
vi.mock('menubar', () => ({
  menubar: vi.fn(() => ({
    on: vi.fn(),
    showWindow: vi.fn(),
    hideWindow: vi.fn(),
    window: {
      webContents: {
        send: vi.fn(),
      },
    },
    tray: {
      setImage: vi.fn(),
      setToolTip: vi.fn(),
    },
  })),
}));

// Setup fetch mock
global.fetch = vi.fn();

// Setup window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    search: '',
    hash: '',
  },
  writable: true,
});

// Setup window.gitify mock (from preload script)
Object.defineProperty(window, 'gitify', {
  value: {
    openExternalLink: vi.fn(),
    app: {
      version: vi.fn().mockResolvedValue('v0.0.1'),
      quit: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
    },
    encryptValue: vi.fn().mockResolvedValue('encrypted'),
    decryptValue: vi.fn().mockResolvedValue('decrypted'),
    setAutoLaunch: vi.fn(),
    setKeyboardShortcut: vi.fn(),
    tray: {
      useAlternateIdleIcon: vi.fn(),
      updateIcon: vi.fn(),
      updateTitle: vi.fn(),
    },
    platform: {
      isWindows: vi.fn().mockReturnValue(false),
    },
    onSystemThemeUpdate: vi.fn(),
    onResetApp: vi.fn(),
    raiseNativeNotification: vi.fn(),
    raiseSoundNotification: vi.fn(),
    notificationSoundPath: vi.fn().mockResolvedValue('/path/to/sound.mp3'),
  },
  writable: true,
});
