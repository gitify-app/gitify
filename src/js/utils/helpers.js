const ipcRenderer = window.require('electron').ipcRenderer;

export default {
  updateTrayIcon(notifications) {
    if (notifications.length > 0) {
      ipcRenderer.send('update-icon', 'TrayActive');
    } else {
      ipcRenderer.send('update-icon', 'TrayIdle');
    }
  }
};
