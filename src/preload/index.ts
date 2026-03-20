import { contextBridge, webFrame } from 'electron';

import { APPLICATION } from '../shared/constants';
import { EVENTS } from '../shared/events';
import { isLinux, isMacOS, isWindows } from '../shared/platform';

import { invokeMainEvent, onRendererEvent, sendMainEvent } from './utils';

/**
 * The Gitify Bridge API exposed to the renderer via `contextBridge`.
 *
 * All renderer↔main IPC communication must go through this object.
 * It is available on `window.gitify` inside the renderer process.
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
  encryptValue: (value: string) =>
    invokeMainEvent(EVENTS.SAFE_STORAGE_ENCRYPT, value),

  /**
   * Decrypt an encrypted string using Electron's safe storage.
   *
   * @param value - The encrypted string to decrypt.
   * @returns A promise resolving to the plaintext string.
   */
  decryptValue: (value: string) =>
    invokeMainEvent(EVENTS.SAFE_STORAGE_DECRYPT, value),

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
   * Register or unregister the global keyboard shortcut for toggling the app window.
   *
   * @param keyboardShortcut - `true` to register the shortcut, `false` to unregister.
   */
  setKeyboardShortcut: (keyboardShortcut: boolean) => {
    sendMainEvent(EVENTS.UPDATE_KEYBOARD_SHORTCUT, {
      enabled: keyboardShortcut,
      keyboardShortcut: APPLICATION.DEFAULT_KEYBOARD_SHORTCUT,
    });
  },

  /** Tray icon controls. */
  tray: {
    /**
     * Update the tray icon color based on unread notification count.
     *
     * Pass a negative number to set the error state color.
     *
     * @param notificationsCount - Number of unread notifications.
     */
    updateColor: (notificationsCount = 0) => {
      sendMainEvent(EVENTS.UPDATE_ICON_COLOR, notificationsCount);
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
    useAlternateIdleIcon: (value: boolean) =>
      sendMainEvent(EVENTS.USE_ALTERNATE_IDLE_ICON, value),

    /**
     * Switch the tray icon to an "active" variant when there are unread notifications.
     *
     * @param value - `true` to use the unread-active icon, `false` for the default.
     */
    useUnreadActiveIcon: (value: boolean) =>
      sendMainEvent(EVENTS.USE_UNREAD_ACTIVE_ICON, value),
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

  /** Application update prompt controls. */
  updates: {
    /**
     * Set how often Gitify shows the “Application Update / Restart / Later” dialog
     * after downloading an update.
     *
     * @param frequency - One of: DAILY | WEEKLY | MONTHLY | NEVER
     */
    setUpdatePromptQuietFrequency: (frequency: string) =>
      sendMainEvent(EVENTS.UPDATE_PROMPT_QUIET_FREQUENCY, frequency),
  },

  /** Electron web frame zoom controls. */
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
   */
  onResetApp: (callback: () => void) => {
    onRendererEvent(EVENTS.RESET_APP, () => callback());
  },

  /**
   * Register a callback invoked when the main process delivers an OAuth callback URL.
   *
   * @param callback - Called with the full callback URL (e.g. `gitify://oauth?code=...`).
   */
  onAuthCallback: (callback: (url: string) => void) => {
    onRendererEvent(EVENTS.AUTH_CALLBACK, (_, url) => callback(url));
  },

  /**
   * Register a callback invoked when the OS system theme changes.
   *
   * @param callback - Called with the new theme string (`"light"` or `"dark"`).
   */
  onSystemThemeUpdate: (callback: (theme: string) => void) => {
    onRendererEvent(EVENTS.UPDATE_THEME, (_, theme) => callback(theme));
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

// Use `contextBridge` APIs to expose Electron APIs to renderer
// Context isolation is always enabled in this app
try {
  contextBridge.exposeInMainWorld('gitify', api);
} catch (error) {
  // biome-ignore lint/suspicious/noConsole: preload environment is strictly sandboxed
  console.error(
    '[preload] Failed to expose Gitify Bridge API to renderer',
    error,
  );
}
