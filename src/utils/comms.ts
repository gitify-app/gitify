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

export function updateTrayIcon({
  notificationsCount,
  showNotificationsCountInTray,
}: {
  notificationsCount?: number;
  showNotificationsCountInTray?: boolean;
}): void {
  ipcRenderer.send('update-icon', {
    notificationsCount,
    showNotificationsCountInTray,
  });
}

export function restoreSetting(setting, value): void {
  ipcRenderer.send(setting, value);
}
