const ipcRenderer = window.require('electron').ipcRenderer;

export default {
  updateTrayIcon(notificationsLength) {
    if (notificationsLength > 0) {
      ipcRenderer.send('update-icon', 'TrayActive');
    } else {
      ipcRenderer.send('update-icon', 'TrayIdle');
    }
  }
};
