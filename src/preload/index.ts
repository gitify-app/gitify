import { contextBridge, webFrame } from 'electron';

import { APPLICATION } from '../shared/constants';
import { EVENTS } from '../shared/events';
import { isLinux, isMacOS, isWindows } from '../shared/platform';

import { invokeMainEvent, onRendererEvent, sendMainEvent } from './utils';

export const api = {
  openExternalLink: (url: string, openInForeground: boolean) => {
    sendMainEvent(EVENTS.OPEN_EXTERNAL, {
      url: url,
      activate: openInForeground,
    });
  },

  encryptValue: (value: string) =>
    invokeMainEvent(EVENTS.SAFE_STORAGE_ENCRYPT, value),

  decryptValue: (value: string) =>
    invokeMainEvent(EVENTS.SAFE_STORAGE_DECRYPT, value),

  setAutoLaunch: (value: boolean) =>
    sendMainEvent(EVENTS.UPDATE_AUTO_LAUNCH, {
      openAtLogin: value,
      openAsHidden: value,
    }),

  setKeyboardShortcut: (keyboardShortcut: boolean) => {
    sendMainEvent(EVENTS.UPDATE_KEYBOARD_SHORTCUT, {
      enabled: keyboardShortcut,
      keyboardShortcut: APPLICATION.DEFAULT_KEYBOARD_SHORTCUT,
    });
  },

  tray: {
    updateColor: (notificationsCount = 0) => {
      sendMainEvent(EVENTS.UPDATE_ICON_COLOR, notificationsCount);
    },

    updateTitle: (title = '') => sendMainEvent(EVENTS.UPDATE_ICON_TITLE, title),

    useAlternateIdleIcon: (value: boolean) =>
      sendMainEvent(EVENTS.USE_ALTERNATE_IDLE_ICON, value),

    useUnreadActiveIcon: (value: boolean) =>
      sendMainEvent(EVENTS.USE_UNREAD_ACTIVE_ICON, value),
  },

  notificationSoundPath: () => invokeMainEvent(EVENTS.NOTIFICATION_SOUND_PATH),

  twemojiDirectory: () => invokeMainEvent(EVENTS.TWEMOJI_DIRECTORY),

  platform: {
    isLinux: () => isLinux(),

    isMacOS: () => isMacOS(),

    isWindows: () => isWindows(),
  },

  app: {
    hide: () => sendMainEvent(EVENTS.WINDOW_HIDE),

    show: () => sendMainEvent(EVENTS.WINDOW_SHOW),

    quit: () => sendMainEvent(EVENTS.QUIT),

    version: async () => {
      if (process.env.NODE_ENV === 'development') {
        return 'dev';
      }

      const version = await invokeMainEvent(EVENTS.VERSION);

      return `v${version}`;
    },
  },

  zoom: {
    getLevel: () => webFrame.getZoomLevel(),

    setLevel: (zoomLevel: number) => webFrame.setZoomLevel(zoomLevel),
  },

  onResetApp: (callback: () => void) => {
    onRendererEvent(EVENTS.RESET_APP, () => callback());
  },

  onAuthCallback: (callback: (url: string) => void) => {
    onRendererEvent(EVENTS.AUTH_CALLBACK, (_, url) => callback(url));
  },

  onSystemThemeUpdate: (callback: (theme: string) => void) => {
    onRendererEvent(EVENTS.UPDATE_THEME, (_, theme) => callback(theme));
  },

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
