const { ipcRenderer, shell } = require('electron');
const remote = require('@electron/remote');

export function openExternalLink(url: string): void {
  shell.openExternal(url);
}

export function setAutoLaunch(value: boolean): void {
  remote.app.setLoginItemSettings({
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
