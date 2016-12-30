const ipcRenderer = window.require('electron').ipcRenderer;

export function restoreSettings (settings) {
  const showAppIcon = settings.get('showAppIcon');
  ipcRenderer.send('show-app-icon', showAppIcon);
};
