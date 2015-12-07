const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;

const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const Tray = electron.Tray;

var path = require('path');
var ghReleases = require('electron-gh-releases');

require('crash-reporter').start();

var AutoLaunch = require('auto-launch');
var dialog = require('dialog');

// Status icons
var iconIdle = path.join(__dirname, 'images', 'tray-idleTemplate.png');
var iconActive = path.join(__dirname, 'images', 'tray-active.png');

// Utilities
var isLinux = (process.platform === 'linux');
var isDarwin = (process.platform === 'darwin');
// var isWindows = (process.platform === 'win32');

// The auto-start module does not support Linux
if (!isLinux) {
  var autoStart = new AutoLaunch({
    name: 'Gitify'
  });
}

app.on('ready', function() {
  var appIcon = new Tray(iconIdle);

  var options = {
    x: null,
    y: null
  };

  initWindow();

  appIcon.on('click', function (e, bounds) {
    if (appIcon.window && appIcon.window.isVisible()) {
      return hideWindow();
    } else {
      showWindow(bounds);
    }
  });

  function initWindow () {
    var defaults = {
      width: 400,
      height: 350,
      show: false,
      frame: false,
      resizable: false,
      'standard-window': false
    };

    appIcon.window = new BrowserWindow(defaults);
    appIcon.window.loadURL('file://' + __dirname + '/index.html');
    appIcon.window.on('blur', hideWindow);
    appIcon.window.setVisibleOnAllWorkspaces(true);

    initMenu();

    if (!isLinux) {
      checkAutoUpdate(false);
    }
  }

  function showWindow (bounds) {
    if (options.x) {
      appIcon.window.show();
    } else {
      if (bounds) {
        options.x = bounds.x - 200 + (bounds.width / 2);
        options.y = bounds.y;
        appIcon.window.setPosition(options.x, options.y);
      } else {
        var electronScreen = require('screen');
        var defaultSize = electronScreen.getPrimaryDisplay().workAreaSize;
        appIcon.window.setPosition(defaultSize.width - 525, 15);
      }
    }
    appIcon.window.show();
  }

  function initMenu () {
    var template = [{
      label: 'Edit',
      submenu: [
        {
          label: 'Copy',
          accelerator: 'Command+C',
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }
      ]
    }];

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  function hideWindow () {
    if (!appIcon.window) { return; }
    appIcon.window.hide();
  }

  function checkAutoUpdate (showAlert) {
    var autoUpdateOptions = {
      repo: 'ekonstantinidis/gitify',
      currentVersion: app.getVersion()
    };

    var update = new ghReleases(autoUpdateOptions, function (autoUpdater) {
      autoUpdater
        .on('error', function (event, message) {
          console.log('ERRORED.');
          console.log('Event: ' + JSON.stringify(event) + '. MESSAGE: ' + message);
        })
        .on('update-downloaded', function (event, releaseNotes, releaseName,
            releaseDate, updateUrl, quitAndUpdate) {
          console.log('Update downloaded');
          confirmAutoUpdate(quitAndUpdate);
        });
    });

    // Check for updates
    update.check(function (err, status) {
      if (err || !status) {
        if (showAlert) {
          dialog.showMessageBox({
            type: 'info',
            buttons: ['Close'],
            title: 'No update available',
            message: 'You are currently running the latest version of Gitify.'
          });
        }

        if (isDarwin) {
          app.dock.hide();
        }
      }

      if (!err && status) {
        update.download();
      }
    });
  }

  function confirmAutoUpdate (quitAndUpdate) {
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Update & Restart', 'Cancel'],
      title: 'Update Available',
      cancelId: 99,
      message: 'There is an update available. Would you like to update Gitify now?'
    }, function (response) {
      console.log('Exit: ' + response);
      if (isDarwin) {
        app.dock.hide();
      }
      if (response === 0) {
        quitAndUpdate();
      }
    } );
  }

  ipc.on('reopen-window', function () {
    showWindow();
  });

  ipc.on('update-icon', function (event, arg) {
    if (arg === 'TrayActive') {
      appIcon.setImage(iconActive);
    } else {
      appIcon.setImage(iconIdle);
    }
  });

  ipc.on('startup-enable', function () {
    if (!isLinux) {
      autoStart.enable();
    }
  });

  ipc.on('startup-disable', function () {
    if (!isLinux) {
      autoStart.disable();
    }
  });

  ipc.on('check-update', function () {
    checkAutoUpdate(true);
  });

  ipc.on('app-quit', function () {
    app.quit();
  });

  appIcon.setToolTip('GitHub Notifications on your menu bar.');
});
