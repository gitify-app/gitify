import { contextBridge, ipcRenderer, shell } from 'electron';
import { namespacedEvent } from '../shared/events';

import { type Link, OpenPreference } from '../renderer/types';
import { Constants } from '../renderer/utils/constants';
import { isLinux, isMacOS, isWindows } from '../shared/platform';

const api = {
  openExternalLink: (url: Link, openPreference: OpenPreference) => {
    console.log('PRELOAD OPEN LINK');

    shell.openExternal(url, {
      activate: openPreference === OpenPreference.FOREGROUND,
    });
  },

  getAppVersion: () => {
    if (process.env.NODE_ENV === 'development') {
      return 'dev';
    }

    ipcRenderer.invoke(namespacedEvent('version'));
  },

  encryptValue: (value: string) =>
    ipcRenderer.invoke(namespacedEvent('safe-storage-encrypt'), value),

  decryptValue: (value: string) =>
    ipcRenderer.invoke(namespacedEvent('safe-storage-decrypt'), value),

  quitApp: () => ipcRenderer.send(namespacedEvent('quit')),

  showWindow: () => ipcRenderer.send(namespacedEvent('window-show')),

  hideWindow: () => ipcRenderer.send(namespacedEvent('window-hide')),

  setAutoLaunch: (value: boolean) =>
    ipcRenderer.send(namespacedEvent('update-auto-launch'), {
      openAtLogin: value,
      openAsHidden: value,
    }),

  setAlternateIdleIcon: (value: boolean) =>
    ipcRenderer.send(namespacedEvent('use-alternate-idle-icon'), value),

  setKeyboardShortcut: (keyboardShortcut: boolean) => {
    ipcRenderer.send(namespacedEvent('update-keyboard-shortcut'), {
      enabled: keyboardShortcut,
      keyboardShortcut: Constants.DEFAULT_KEYBOARD_SHORTCUT,
    });
  },

  updateTrayIcon: (notificationsLength = 0) => {
    if (notificationsLength < 0) {
      ipcRenderer.send(namespacedEvent('icon-error'));
      return;
    }

    if (notificationsLength > 0) {
      ipcRenderer.send(namespacedEvent('icon-active'));
      return;
    }

    ipcRenderer.send(namespacedEvent('icon-idle'));
  },

  updateTrayTitle: (title = '') =>
    ipcRenderer.send(namespacedEvent('update-title'), title),

  isLinux: () => {
    return isLinux();
  },

  isMacOS: () => {
    return isMacOS();
  },

  isWindows: () => {
    return isWindows();
  },
};

contextBridge.exposeInMainWorld('gitify', api);

export type GitifyAPI = typeof api;
