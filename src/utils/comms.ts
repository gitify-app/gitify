import { ipcRenderer, shell } from 'electron';
import { defaultSettings } from '../context/App';
import { type Link, OpenPreference } from '../types';
import Constants from './constants';
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
  return await ipcRenderer.invoke('gitify:version');
}

export function quitApp(): void {
  ipcRenderer.send('gitify:quit');
}

export function showWindow(): void {
  ipcRenderer.send('gitify:window-show');
}

export function hideWindow(): void {
  ipcRenderer.send('gitify:window-hide');
}

export function setAutoLaunch(value: boolean): void {
  ipcRenderer.send('gitify:update-auto-launch', {
    openAtLogin: value,
    openAsHidden: value,
  });
}

export function setKeyboardShortcut(keyboardShortcut: boolean): void {
  ipcRenderer.send('gitify:update-keyboard-shortcut', {
    enabled: keyboardShortcut,
    keyboardShortcut: Constants.DEFAULT_KEYBOARD_SHORTCUT,
  });
}

export function updateTrayIcon(notificationsLength = 0): void {
  if (notificationsLength > 0) {
    ipcRenderer.send('gitify:icon-active');
  } else {
    ipcRenderer.send('gitify:icon-idle');
  }
}

export function updateTrayTitle(title = ''): void {
  ipcRenderer.send('gitify:update-title', title);
}
