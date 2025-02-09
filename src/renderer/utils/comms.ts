// import { shell } from 'electron';
// import { namespacedEvent } from '../../shared/events';
// import { defaultSettings } from '../context/App';
import type { Link } from '../types';
// import { Constants } from './constants';
// import { loadState } from './storage';

export function openExternalLink(_url: Link): void {
  // if (url.toLowerCase().startsWith('https://')) {
  //   // Load the state from local storage to avoid having to pass settings as a parameter
  //   const { settings } = loadState();
  //   const_openPreference = settings
  //     ? settings.openLinks
  //     : defaultSettings.openLinks;
  //   // shell.openExternal(url, {
  //   //   activate: openPreference === OpenPreference.FOREGROUND,
  //   // });
  // }
}

export async function getAppVersion(): Promise<string> {
  return await window.gitify.getAppVersion();
  // return await ipcRenderer.invoke(namespacedEvent('version'));
}

export async function encryptValue(value: string): Promise<string> {
  return await window.gitify.encryptValue(value);

  // return await ipcRenderer.invoke(
  //   namespacedEvent('safe-storage-encrypt'),
  //   value,
  // );
}

export async function decryptValue(value: string): Promise<string> {
  return await window.gitify.decryptValue(value);
  // return await ipcRenderer.invoke(
  //   namespacedEvent('safe-storage-decrypt'),
  //   value,
  // );
}

export function quitApp(): void {
  window.gitify.quitApp();
  // ipcRenderer.send(namespacedEvent('quit'));
}

export function showWindow(): void {
  window.gitify.showWindow();
  // ipcRenderer.send(namespacedEvent('window-show'));
}

export function hideWindow(): void {
  window.gitify.hideWindow();
  // ipcRenderer.send(namespacedEvent('window-hide'));
}

export function setAutoLaunch(value: boolean): void {
  window.gitify.setAutoLaunch(value);
  // ipcRenderer.send(namespacedEvent('update-auto-launch'), {
  //   openAtLogin: value,
  //   openAsHidden: value,
  // });
}

export function setAlternateIdleIcon(value: boolean): void {
  window.gitify.setAlternateIdleIcon(value);
  // ipcRenderer.send(namespacedEvent('use-alternate-idle-icon'), value);
}

export function setKeyboardShortcut(keyboardShortcut: boolean): void {
  window.gitify.setKeyboardShortcut(keyboardShortcut);
  // ipcRenderer.send(namespacedEvent('update-keyboard-shortcut'), {
  //   enabled: keyboardShortcut,
  //   keyboardShortcut: Constants.DEFAULT_KEYBOARD_SHORTCUT,
  // });
}

export function updateTrayIcon(notificationsLength = 0): void {
  window.gitify.updateTrayIcon(notificationsLength);
  //   if (notificationsLength < 0) {
  //     ipcRenderer.send(namespacedEvent('icon-error'));
  //     return;
  //   }

  //   if (notificationsLength > 0) {
  //     ipcRenderer.send(namespacedEvent('icon-active'));
  //     return;
  //   }

  //   ipcRenderer.send(namespacedEvent('icon-idle'));
}

export function updateTrayTitle(title = ''): void {
  window.gitify.updateTrayTitle(title);
  // ipcRenderer.send(namespacedEvent('update-title'), title);
}
