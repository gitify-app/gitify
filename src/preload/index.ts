import { contextBridge, webFrame } from 'electron';

import type { IKeyboardShortcut } from '../shared/events';
import { EVENTS } from '../shared/events';
import { isLinux, isMacOS, isWindows } from '../shared/platform';

import { invokeMainEvent, onRendererEvent, sendMainEvent } from './utils';

/**
 * The Gitify Bridge API exposed to the renderer via `contextBridge`.
 *
 * Provides a safe, sandboxed interface for IPC communication between renderer and main.
 * Accessible as `window.gitify` in the renderer.
 */
export const api = {
  /**
   * Open a URL in the user's default browser.
   *
   * @param url - The URL to open.
   * @param openInForeground - When `true`, brings the browser to the foreground.
   */
  openExternalLink: (url: string, openInForeground: boolean) => {
    sendMainEvent(EVENTS.OPEN_EXTERNAL, {
      url: url,
      activate: openInForeground,
    });
  },

  /**
   * Encrypt a plaintext string using Electron's safe storage.
   *
   * @param value - The plaintext string to encrypt.
   * @returns A promise resolving to the encrypted string.
   */
  encryptValue: (value: string) => invokeMainEvent(EVENTS.SAFE_STORAGE_ENCRYPT, value),

  /**
   * Decrypt an encrypted string using Electron's safe storage.
   *
   * @param value - The encrypted string to decrypt.
   * @returns A promise resolving to the plaintext string.
   */
  decryptValue: (value: string) => invokeMainEvent(EVENTS.SAFE_STORAGE_DECRYPT, value),

  /**
   * Enable or disable launching the application at system login.
   *
   * @param value - `true` to enable auto-launch, `false` to disable.
   */
  setAutoLaunch: (value: boolean) =>
    sendMainEvent(EVENTS.UPDATE_AUTO_LAUNCH, {
      openAtLogin: value,
      openAsHidden: value,
    }),

  /**
   * Enable or disable keeping the window open when it loses focus.
   *
   * Implemented by toggling the window's `alwaysOnTop` flag, which the
   * `menubar` library uses to short-circuit its blur-driven hide.
   *
   * @param value - `true` to keep the window open on blur, `false` to hide.
   */
  setKeepWindowOnBlur: (value: boolean) => sendMainEvent(EVENTS.UPDATE_KEEP_WINDOW_ON_BLUR, value),

  /**
   * Apply the global keyboard shortcut for toggling the app window visibility.
   *
   * @param payload - Whether the shortcut is enabled and the Electron accelerator string.
   * @returns Whether registration succeeded (when enabled).
   */
  applyKeyboardShortcut: (payload: IKeyboardShortcut) =>
    invokeMainEvent(EVENTS.UPDATE_KEYBOARD_SHORTCUT, payload),

  /** Tray icon controls. */
  tray: {
    /**
     * Update the tray icon color based on unread notification count.
     *
     * Pass a negative number to set the error state color.
     *
     * @param notificationsCount - Number of unread notifications.
     * @param isOnline - Whether the application is currently online.
     */
    updateColor: (notificationsCount = 0, isOnline = true) => {
      sendMainEvent(EVENTS.UPDATE_ICON_COLOR, { notificationsCount, isOnline });
    },

    /**
     * Update the tray icon title (the text shown next to the icon).
     *
     * @param title - The title string to display. Pass an empty string to clear it.
     */
    updateTitle: (title = '') => sendMainEvent(EVENTS.UPDATE_ICON_TITLE, title),

    /**
     * Switch the tray icon to an alternate idle icon variant.
     *
     * @param value - `true` to use the alternate idle icon, `false` for the default.
     */
    useAlternateIdleIcon: (value: boolean) => sendMainEvent(EVENTS.USE_ALTERNATE_IDLE_ICON, value),

    /**
     * Switch the tray icon to an "active" variant when there are unread notifications.
     *
     * @param value - `true` to use the unread-active icon, `false` for the default.
     */
    useUnreadActiveIcon: (value: boolean) => sendMainEvent(EVENTS.USE_UNREAD_ACTIVE_ICON, value),
  },

  /**
   * Resolve the absolute file path of the notification sound asset.
   *
   * @returns A promise resolving to the sound file path.
   */
  notificationSoundPath: () => invokeMainEvent(EVENTS.NOTIFICATION_SOUND_PATH),

  /**
   * Resolve the absolute directory path of the bundled Twemoji assets.
   *
   * @returns A promise resolving to the Twemoji directory path.
   */
  twemojiDirectory: () => invokeMainEvent(EVENTS.TWEMOJI_DIRECTORY),

  /** Platform detection helpers. */
  platform: {
    /** Returns `true` when running on Linux. */
    isLinux: () => isLinux(),

    /** Returns `true` when running on macOS. */
    isMacOS: () => isMacOS(),

    /** Returns `true` when running on Windows. */
    isWindows: () => isWindows(),
  },

  /** Application window and lifecycle controls. */
  app: {
    /** Hide the application window. */
    hide: () => sendMainEvent(EVENTS.WINDOW_HIDE),

    /** Show and focus the application window. */
    show: () => sendMainEvent(EVENTS.WINDOW_SHOW),

    /** Quit the application. */
    quit: () => sendMainEvent(EVENTS.QUIT),

    /**
     * Return the application version string.
     *
     * Returns `"dev"` in development mode; otherwise returns `"v<semver>"`
     * retrieved from the main process.
     *
     * @returns A promise resolving to the version string.
     */
    version: async () => {
      if (process.env.NODE_ENV === 'development') {
        return 'dev';
      }

      const version = await invokeMainEvent(EVENTS.VERSION);

      return `v${version}`;
    },
  },

  /** Electron `webFrame` zoom controls. */
  zoom: {
    /**
     * Return the current Electron zoom level.
     *
     * @returns The current zoom level (0 = 100%).
     */
    getLevel: () => webFrame.getZoomLevel(),

    /**
     * Set the Electron zoom level.
     *
     * @param zoomLevel - The zoom level to apply (0 = 100%).
     */
    setLevel: (zoomLevel: number) => webFrame.setZoomLevel(zoomLevel),
  },

  /**
   * Register a callback invoked when the main process requests an app reset.
   *
   * @param callback - Called when the reset event is received.
   * @returns A function that removes the listener.
   */
  onResetApp: (callback: () => void) => {
    return onRendererEvent(EVENTS.RESET_APP, () => callback());
  },

  /**
   * Register a callback invoked when the system wakes from sleep or the user
   * unlocks their screen.
   *
   * Use this to refetch stale data and re-sync online/offline state without
   * waiting for the next scheduled poll interval.
   *
   * @param callback - Called with no arguments on every wake event.
   * @returns A function that removes the listener.
   */
  onSystemWake: (callback: () => void) => {
    return onRendererEvent(EVENTS.SYSTEM_WAKE, () => callback());
  },

  /**
   * Register a callback invoked when the main process delivers an OAuth callback URL.
   *
   * @param callback - Called with the full callback URL (e.g. `gitify://oauth?code=...`).
   * @returns A function that removes the listener.
   */
  onAuthCallback: (callback: (url: string) => void) => {
    return onRendererEvent(EVENTS.AUTH_CALLBACK, (_, url) => callback(url));
  },

  /**
   * Display a native OS notification.
   *
   * Clicking the notification opens `url` in the browser (hiding the app window),
   * or shows the app window if no URL is provided.
   *
   * @param title - The notification title.
   * @param body - The notification body text.
   * @param url - Optional URL to open when the notification is clicked.
   * @returns The created `Notification` instance.
   */
  raiseNativeNotification: (title: string, body: string, url?: string) => {
    const notification = new Notification(title, { body: body, silent: true });
    notification.onclick = () => {
      if (url) {
        api.app.hide();
        api.openExternalLink(url, true);
      } else {
        api.app.show();
      }
    };

    return notification;
  },
};

/**
 * Use `contextBridge` APIs to expose Electron APIs to renderer.
 * Context isolation is always enabled in this app
 */
try {
  contextBridge.exposeInMainWorld('gitify', api);
} catch (error) {
  // oxlint-disable-next-line no-console -- preload environment is strictly sandboxed
  console.error('[preload] Failed to expose Gitify Bridge API to renderer', error);
}
