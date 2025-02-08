import { contextBridge, ipcRenderer } from 'electron';
import { namespacedEvent } from '../shared/events';

import { Constants } from '../renderer/utils/constants';
import type { GitifyAPI } from './types';

const api: GitifyAPI = {
  // Define the global variable
  global: globalThis,

  openExternalLink: (url) =>
    ipcRenderer.send(namespacedEvent('open-external-link'), url),

  getAppVersion: () => ipcRenderer.invoke(namespacedEvent('version')),

  encryptValue: (value) =>
    ipcRenderer.invoke(namespacedEvent('safe-storage-encrypt'), value),

  decryptValue: (value) =>
    ipcRenderer.invoke(namespacedEvent('safe-storage-decrypt'), value),

  quitApp: () => ipcRenderer.send(namespacedEvent('quit')),

  showWindow: () => ipcRenderer.send(namespacedEvent('window-show')),

  hideWindow: () => ipcRenderer.send(namespacedEvent('window-hide')),

  setAutoLaunch: (value) =>
    ipcRenderer.send(namespacedEvent('update-auto-launch'), {
      openAtLogin: value,
      openAsHidden: value,
    }),

  setAlternateIdleIcon: (value) =>
    ipcRenderer.send(namespacedEvent('use-alternate-idle-icon'), value),

  setKeyboardShortcut: (keyboardShortcut) =>
    ipcRenderer.send(namespacedEvent('update-keyboard-shortcut'), {
      enabled: keyboardShortcut,
      keyboardShortcut: Constants.DEFAULT_KEYBOARD_SHORTCUT,
    }),

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
    // ipcRenderer.send(namespacedEvent('update-tray-icon'), notificationsLength),
  },

  updateTrayTitle: (title = '') =>
    ipcRenderer.send(namespacedEvent('update-title'), title),
};

contextBridge.exposeInMainWorld('gitify', api);
