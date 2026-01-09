/**
 * Tauri Bridge API
 * Replaces Electron's window.gitify API with Tauri equivalents
 */

import { invoke } from '@tauri-apps/api/core';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { listen } from '@tauri-apps/api/event';
import { disable, enable } from '@tauri-apps/plugin-autostart';
import {
  isRegistered,
  register,
  unregister,
} from '@tauri-apps/plugin-global-shortcut';

// Types for updater events
interface UpdateAvailablePayload {
  version: string;
  current_version: string;
  body: string | null;
}

interface DownloadProgressPayload {
  percent: number;
  downloaded: number;
  total: number | null;
}

interface UpdateStatus {
  checking: boolean;
  update_available: boolean;
  update_downloaded: boolean;
}

// Platform detection - cached from backend
let cachedPlatform: string | null = null;

// Initialize platform from backend (called at module load)
async function initializePlatform(): Promise<void> {
  try {
    cachedPlatform = await invoke<string>('get_platform');
  } catch {
    // Fallback if backend call fails during initialization
    cachedPlatform = 'unknown';
  }
}

// Start platform initialization immediately
initializePlatform();

const isLinux = () => cachedPlatform === 'linux';
const isMacOS = () => cachedPlatform === 'macos';
const isWindows = () => cachedPlatform === 'windows';

export const api = {
  /**
   * Open external link in browser
   */
  openExternalLink: async (url: string, _openInForeground: boolean) => {
    await invoke('open_external_link', { url });
  },

  /**
   * Encrypt value using OS keyring
   * Returns a unique identifier for this token
   */
  encryptValue: async (value: string): Promise<string> => {
    // Generate a unique identifier for this token using crypto-safe random UUID
    const identifier = `token_${crypto.randomUUID()}`;
    await invoke('encrypt_token', { token: value, identifier });
    // Return the identifier as the "encrypted" value
    return identifier;
  },

  /**
   * Decrypt value from OS keyring
   * The 'value' parameter is the identifier returned from encryptValue
   */
  decryptValue: async (value: string): Promise<string> => {
    // Use the value as the identifier to retrieve from keyring
    return await invoke<string>('decrypt_token', { identifier: value });
  },

  /**
   * Exchange OAuth authorization code for access token using user-provided credentials
   * This is performed server-side in Rust to keep the client secret secure
   */
  exchangeOAuthCode: async (
    hostname: string,
    clientId: string,
    clientSecret: string,
    code: string,
  ): Promise<string> => {
    return await invoke<string>('exchange_oauth_code', {
      hostname,
      clientId,
      clientSecret,
      code,
    });
  },

  /**
   * Exchange OAuth authorization code for access token using the default GitHub App credentials
   * The credentials are embedded in the Rust backend at build time
   */
  exchangeGitHubAppCode: async (code: string): Promise<string> => {
    return await invoke<string>('exchange_github_app_code', { code });
  },

  /**
   * Get the GitHub App client ID for constructing the authorization URL
   * Only the client ID (which is public) is exposed - the secret remains in the backend
   */
  getGitHubAppClientId: async (): Promise<string> => {
    return await invoke<string>('get_github_app_client_id');
  },

  /**
   * Set auto-launch on system startup
   */
  setAutoLaunch: async (value: boolean) => {
    if (value) {
      await enable();
    } else {
      await disable();
    }
  },

  /**
   * Set global keyboard shortcut
   */
  setKeyboardShortcut: async (keyboardShortcut: boolean) => {
    const shortcut = 'CommandOrControl+Shift+G'; // Default from Electron version

    if (keyboardShortcut) {
      const registered = await isRegistered(shortcut);
      if (!registered) {
        await register(shortcut, async () => {
          await invoke('toggle_window');
        });
      }
    } else {
      await unregister(shortcut);
    }
  },

  /**
   * Tray icon controls
   */
  tray: {
    /**
     * Update tray icon color based on notification count
     * Passing a negative number will set the error state color
     */
    updateColor: async (notificationsCount = 0) => {
      let state: string;

      if (notificationsCount < 0) {
        state = 'error';
      } else if (notificationsCount > 0) {
        state = 'active';
      } else {
        state = 'idle';
      }
      await invoke('update_tray_icon', { state });
    },

    /**
     * Update tray title (macOS notification badge)
     */
    updateTitle: async (title = '') => {
      await invoke('update_tray_title', { title });
    },

    /**
     * Use alternate idle icon
     */
    useAlternateIdleIcon: async (value: boolean) => {
      await invoke('set_alternate_idle_icon', { enabled: value });
    },

    /**
     * Use unread active icon
     */
    useUnreadActiveIcon: async (value: boolean) => {
      await invoke('set_unread_active_icon', { enabled: value });
    },
  },

  /**
   * Get notification sound path
   */
  notificationSoundPath: async (): Promise<string> => {
    return await invoke<string>('get_notification_sound_path');
  },

  /**
   * Get Twemoji directory path
   */
  twemojiDirectory: async (): Promise<string> => {
    return await invoke<string>('get_twemoji_directory');
  },

  /**
   * Platform detection utilities
   */
  platform: {
    isLinux,
    isMacOS,
    isWindows,
  },

  /**
   * App controls
   */
  app: {
    /**
     * Hide the app window
     */
    hide: async () => {
      await invoke('hide_window');
    },

    /**
     * Show the app window
     */
    show: async () => {
      await invoke('show_window');
    },

    /**
     * Quit the application
     */
    quit: async () => {
      await invoke('quit_app');
    },

    /**
     * Get app version
     */
    version: async (): Promise<string> => {
      if (import.meta.env.DEV) {
        return 'dev';
      }

      const version = await invoke<string>('get_app_version');
      return `v${version}`;
    },
  },

  /**
   * Zoom controls
   * Note: In Tauri, we use CSS zoom property instead of webFrame
   * CSS zoom is now well-supported in all modern browsers including Firefox 126+
   */
  zoom: {
    /**
     * Get current zoom level
     * Returns a zoom level like Electron's webFrame.getZoomLevel()
     * 0 = 100%, positive = zoomed in, negative = zoomed out
     */
    getLevel: (): number => {
      const zoomLevel = localStorage.getItem('zoomLevel');
      return zoomLevel ? Number.parseFloat(zoomLevel) : 0;
    },

    /**
     * Set zoom level
     * Uses CSS zoom property for clean scaling without layout issues
     * @param zoomLevel - zoom level where 0 = 100%, each unit is ~20% change
     */
    setLevel: (zoomLevel: number) => {
      localStorage.setItem('zoomLevel', zoomLevel.toString());

      // Calculate zoom factor: 1.2^zoomLevel gives ~20% per level
      // This matches Electron's webFrame behavior
      const zoomFactor = 1.2 ** zoomLevel;

      // Apply zoom using CSS zoom property on the root app container
      // This scales content without affecting viewport/scrolling behavior
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.zoom = zoomFactor.toString();
      }
    },
  },

  /**
   * Listen for reset app event
   * Returns cleanup function to remove the listener
   */
  onResetApp: async (callback: () => void): Promise<UnlistenFn> => {
    return await listen('reset-app', () => callback());
  },

  /**
   * Listen for OAuth callback
   * Returns cleanup function to remove the listener
   */
  onAuthCallback: async (
    callback: (url: string) => void,
  ): Promise<UnlistenFn> => {
    return await listen<string>('auth-callback', (event) => {
      callback(event.payload);
    });
  },

  /**
   * Listen for system theme updates
   * Returns cleanup function to remove both the mediaQuery listener and Tauri event listener
   */
  onSystemThemeUpdate: async (
    callback: (theme: string) => void,
  ): Promise<() => void> => {
    // Tauri uses native theme detection
    // We can listen to system theme changes via matchMedia
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);

    // Also listen for any explicit theme update events from Rust
    const unlisten = await listen<string>('system-theme-update', (event) => {
      callback(event.payload);
    });

    // Call immediately with current theme
    callback(mediaQuery.matches ? 'dark' : 'light');

    // Return cleanup function that removes both listeners
    return () => {
      mediaQuery.removeEventListener('change', handler);
      unlisten();
    };
  },

  /**
   * Request notification permission
   * Returns true if permission is granted, false otherwise
   */
  requestNotificationPermission: async (): Promise<boolean> => {
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    // Request permission
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Check if notifications are permitted
   */
  isNotificationSupported: (): boolean => {
    return Notification.permission === 'granted';
  },

  /**
   * Raise native notification
   * Uses the Web Notification API which supports click handlers.
   * The Tauri notification plugin doesn't support click handlers on desktop,
   * so we use the browser's built-in Notification API instead.
   *
   * @param title - Notification title
   * @param body - Notification body text
   * @param url - Optional URL to open when clicked
   * @returns The Notification object, or null if permission not granted
   */
  raiseNativeNotification: (
    title: string,
    body: string,
    url?: string | null,
  ): Notification | null => {
    if (Notification.permission !== 'granted') {
      // Try to request permission asynchronously for next time
      api.requestNotificationPermission();
      return null;
    }

    // Create the notification using the Web Notification API
    // We use silent: true because we play our own sound
    const notification = new Notification(title, { body, silent: true });

    // Handle notification click
    notification.onclick = async (event) => {
      event.preventDefault();

      if (url) {
        // If a URL is provided, open it in the default browser
        await api.app.hide();
        await api.openExternalLink(url, true);
      } else {
        // If no URL, just show and focus the app window
        await api.app.show();
      }
    };

    return notification;
  },

  /**
   * Auto-updater controls
   */
  updater: {
    /**
     * Manually check for updates
     */
    checkForUpdates: async (): Promise<void> => {
      await invoke('check_for_updates');
    },

    /**
     * Install a downloaded update and restart the app
     */
    installUpdate: async (): Promise<void> => {
      await invoke('install_update');
    },

    /**
     * Get current update status
     */
    getStatus: async (): Promise<UpdateStatus> => {
      return await invoke<UpdateStatus>('get_update_status');
    },

    /**
     * Listen for updater checking event
     */
    onChecking: async (callback: () => void): Promise<UnlistenFn> => {
      return await listen('updater:checking', () => callback());
    },

    /**
     * Listen for update available event
     */
    onUpdateAvailable: async (
      callback: (payload: UpdateAvailablePayload) => void,
    ): Promise<UnlistenFn> => {
      return await listen<UpdateAvailablePayload>(
        'updater:available',
        (event) => callback(event.payload),
      );
    },

    /**
     * Listen for no update available event
     */
    onNoUpdateAvailable: async (callback: () => void): Promise<UnlistenFn> => {
      return await listen('updater:not-available', () => callback());
    },

    /**
     * Listen for download progress event
     */
    onDownloadProgress: async (
      callback: (payload: DownloadProgressPayload) => void,
    ): Promise<UnlistenFn> => {
      return await listen<DownloadProgressPayload>(
        'updater:downloading',
        (event) => callback(event.payload),
      );
    },

    /**
     * Listen for update downloaded event
     */
    onUpdateDownloaded: async (
      callback: (version: string) => void,
    ): Promise<UnlistenFn> => {
      return await listen<string>('updater:downloaded', (event) =>
        callback(event.payload),
      );
    },

    /**
     * Listen for updater error event
     */
    onError: async (callback: (error: string) => void): Promise<UnlistenFn> => {
      return await listen<string>('updater:error', (event) =>
        callback(event.payload),
      );
    },

    /**
     * Listen for restart dialog request
     * Emitted when an update is downloaded and ready to install
     */
    onShowRestartDialog: async (
      callback: (version: string) => void,
    ): Promise<UnlistenFn> => {
      return await listen<string>('updater:show-restart-dialog', (event) =>
        callback(event.payload),
      );
    },

    /**
     * Listen for tooltip update events
     */
    onTooltipUpdate: async (
      callback: (tooltip: string) => void,
    ): Promise<UnlistenFn> => {
      return await listen<string>('updater:tooltip', (event) =>
        callback(event.payload),
      );
    },

    /**
     * Listen for menu state changes
     * States: 'idle', 'checking', 'available', 'no-update', 'ready'
     */
    onMenuStateChange: async (
      callback: (state: string) => void,
    ): Promise<UnlistenFn> => {
      return await listen<string>('updater:menu-state', (event) =>
        callback(event.payload),
      );
    },
  },
};

// Expose API globally for compatibility with Electron code
declare global {
  interface Window {
    gitify: typeof api;
  }
}

window.gitify = api;

export default api;
