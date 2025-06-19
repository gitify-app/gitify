import { ipcRenderer, shell } from 'electron';

import { namespacedEvent } from '../../shared/events';
import { defaultSettings } from '../context/App';
import { type Link, OpenPreference } from '../types';
import { Constants } from './constants';
import { loadState } from './storage';

export function openExternalLink(url: Link): void {
  if (url.toLowerCase().startsWith('https://')) {
    // Load the state from local storage to avoid having to pass settings as a parameter
    const { settings } = loadState();

    const openPreference = settings
      ? settings.openLinks
      : defaultSettings.openLinks;

    shell.openExternal(url, {
      activate: openPreference === OpenPreference.FOREGROUND,
    });
  }
}

export async function getAppVersion(): Promise<string> {
  return await ipcRenderer.invoke(namespacedEvent('version'));
}

export async function encryptValue(value: string): Promise<string> {
  return await ipcRenderer.invoke(
    namespacedEvent('safe-storage-encrypt'),
    value,
  );
}

export async function decryptValue(value: string): Promise<string> {
  return await ipcRenderer.invoke(
    namespacedEvent('safe-storage-decrypt'),
    value,
  );
}

export function quitApp(): void {
  ipcRenderer.send(namespacedEvent('quit'));
}

export function showWindow(): void {
  ipcRenderer.send(namespacedEvent('window-show'));
}

export function hideWindow(): void {
  ipcRenderer.send(namespacedEvent('window-hide'));
}

export function setAutoLaunch(value: boolean): void {
  ipcRenderer.send(namespacedEvent('update-auto-launch'), {
    openAtLogin: value,
    openAsHidden: value,
  });
}

export function setAlternateIdleIcon(value: boolean): void {
  ipcRenderer.send(namespacedEvent('use-alternate-idle-icon'), value);
}

export function setKeyboardShortcut(keyboardShortcut: boolean): void {
  ipcRenderer.send(namespacedEvent('update-keyboard-shortcut'), {
    enabled: keyboardShortcut,
    keyboardShortcut: Constants.DEFAULT_KEYBOARD_SHORTCUT,
  });
}

export function updateTrayIcon(notificationsLength = 0): void {
  if (notificationsLength < 0) {
    ipcRenderer.send(namespacedEvent('icon-error'));
    return;
  }

  if (notificationsLength > 0) {
    ipcRenderer.send(namespacedEvent('icon-active'));
    return;
  }

  ipcRenderer.send(namespacedEvent('icon-idle'));
}

export function updateTrayTitle(title = ''): void {
  ipcRenderer.send(namespacedEvent('update-title'), title);
}
