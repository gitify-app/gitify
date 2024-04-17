import { ipcRenderer, shell } from 'electron';

export function openExternalLink(url: string): void {
  if (!url.toLowerCase().startsWith('file:///')) {
    shell.openExternal(url);
  }
}

export function setAutoLaunch(value: boolean): void {
  ipcRenderer.send('set-login-item-settings', {
    openAtLogin: value,
    openAsHidden: value,
  });
}

export function setKbdShortcut(enabled: boolean, kbdShortcut: string): void {
  ipcRenderer.send('update-kbd-shortcut', { enabled, kbdShortcut });
}

export function updateTrayIcon(notificationsLength = 0): void {
  if (notificationsLength > 0) {
    ipcRenderer.send('update-icon', 'TrayActive');
  } else {
    ipcRenderer.send('update-icon');
  }
}

export function updateTrayTitle(title = ''): void {
  ipcRenderer.send('update-title', title);
}

export function restoreSetting(setting, value): void {
  ipcRenderer.send(setting, value);
}
