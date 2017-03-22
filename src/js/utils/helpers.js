var electron = window.require('electron');
const ipcRenderer = window.require('electron').ipcRenderer;
var remote = electron.remote;
var BrowserWindow = remote.BrowserWindow;

import Constants from './constants';

export default {
  generateGitHubUrl(isEnterprise, url) {
    let newUrl = isEnterprise
      ? url.replace('github.intuit.com/api/v3/repos', 'github.intuit.com')
      : url.replace('api.github.com/repos', 'www.github.com');

    if (newUrl.indexOf('/pulls/') !== -1) {
      newUrl = newUrl.replace('/pulls/', '/pull/');
    }

    if (newUrl.indexOf('/releases/') !== -1) {
      newUrl = newUrl.replace('/repos', '');
      newUrl = newUrl.substr(0, newUrl.lastIndexOf('/'));
    }

    return newUrl;
  },

  authGithub (settings, loginUser) {
    //Build the OAuth consent page URL
    var authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: true,
      webPreferences: {
        nodeIntegration: false
      }
    });
    var githubUrl = `https://${settings.get('baseUrl')}/login/oauth/authorize?`;
    var authUrl = githubUrl + 'client_id=' + settings.get('clientId') + '&scope=' + Constants.SCOPE;
    authWindow.loadURL(authUrl);

    function handleCallback (url) {
      var raw_code = /code=([^&]*)/.exec(url) || null;
      var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
      var error = /\?error=(.+)$/.exec(url);

      if (code || error) {
        // Close the browser if code found or error
        authWindow.destroy();
      }

      // If there is a code, proceed to get token from github
      if (code) {
        loginUser(code);
      } else if (error) {
        alert('Oops! Something went wrong and we couldn\'t ' +
          'log you in using Github. Please try again.');
      }
    }

    // If "Done" button is pressed, hide "Loading"
    authWindow.on('close', function () {
      authWindow.destroy();
    });

    authWindow.webContents.on('will-navigate', function (event, url) {
      handleCallback(url);
    });

    authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
      handleCallback(newUrl);
    });
  }
};
