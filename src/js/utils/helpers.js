const ipcRenderer = window.require('electron').ipcRenderer;

export default {
  updateTrayIcon(notificationsLength) {
    if (notificationsLength > 0) {
      ipcRenderer.send('update-icon', 'TrayActive');
    } else {
      ipcRenderer.send('update-icon', 'TrayIdle');
    }
  },

  generateGitHubUrl(url) {
    var newUrl = url.replace('api.github.com/repos', 'www.github.com');

    if (newUrl.indexOf('/pulls/') !== -1) {
      newUrl = newUrl.replace('/pulls/', '/pull/');
    }

    if (newUrl.indexOf('/releases/') !== -1) {
      newUrl = newUrl.replace('/repos', '');
      newUrl = newUrl.substr(0, newUrl.lastIndexOf('/'));
    }

    return newUrl;
  }
};
