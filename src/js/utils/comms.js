const { ipcRenderer, shell } = require('electron');

export function openExternalLink(url) {
  shell.openExternal(url);
}

export function setAutoLaunch(value) {
  if (value) {
    ipcRenderer.send('startup-enable');
  } else {
    ipcRenderer.send('startup-disable');
  }
}

export function updateTrayIcon(notificationsLength = 0) {
  if (notificationsLength > 0) {
    ipcRenderer.send('update-icon', 'TrayActive');
  } else {
    ipcRenderer.send('update-icon');
  }
}

export function setBadge(notificationsLength) {
  ipcRenderer.send('set-badge', notificationsLength);
}

export function reOpenWindow() {
  ipcRenderer.send('reopen-window');
}

export function restoreSetting(setting, value) {
  ipcRenderer.send(setting, value);
}

export function restoreSettings(settings) {
  const showAppIcon = settings.get('showAppIcon');
  restoreSetting('show-app-icon', showAppIcon);
}
