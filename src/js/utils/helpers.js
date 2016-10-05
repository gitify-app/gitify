const ipcRenderer = window.require('electron').ipcRenderer;
import _ from 'underscore';

export default {
  updateTrayIcon(notificationsLength) {
    if (notificationsLength > 0) {
      ipcRenderer.send('update-icon', 'TrayActive');
    } else {
      ipcRenderer.send('update-icon', 'TrayIdle');
    }
  },

  generateGitHubUrl(subject) {
    var newUrl = subject.url.replace('api.github.com/repos', 'github.com');

    if (newUrl.indexOf('/pulls/') !== -1) {
      newUrl = newUrl.replace('/pulls/', '/pull/');
    }

    if (newUrl.indexOf('/releases/') !== -1) {
      newUrl = newUrl.replace('/repos', '');
      newUrl = newUrl.substr(0, newUrl.lastIndexOf('/'));
    }

    var commentUrl = subject.latest_comment_url;
    if (commentUrl !== null && commentUrl.indexOf('/comments/') !== -1) {
      newUrl = newUrl + '#issuecomment-' + _.last(commentUrl.split('/'));;
    }

    return newUrl;
  }
};
