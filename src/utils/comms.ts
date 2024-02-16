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

export function updateTrayIcon(notificationsLength = 0): void {
  if (notificationsLength > 0) {
    ipcRenderer.send('update-icon', 'TrayActive');
  } else {
    ipcRenderer.send('update-icon');
  }
}

export function restoreSetting(setting, value): void {
  ipcRenderer.send(setting, value);
}
