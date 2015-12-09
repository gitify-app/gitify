const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;

var path = require('path');
var ghReleases = require('electron-gh-releases');
var Positioner = require('electron-positioner');

require('crash-reporter').start();

var Menu = require('menu');
var Tray = require('tray');
var AutoLaunch = require('auto-launch');
var BrowserWindow = require('browser-window');
var dialog = require('dialog');

var iconIdle = path.join(__dirname, 'images', 'tray-idleTemplate.png');
var iconActive = path.join(__dirname, 'images', 'tray-active.png');

var autoStart = new AutoLaunch({
  name: 'Gitify',
  path: process.execPath.match(/.*?\.app/)[0]
});

app.on('ready', function() {
  var cachedBounds;
  var appIcon = new Tray(iconIdle);
  var windowPosition = (process.platform === 'win32') ? 'trayBottomCenter' : 'trayCenter';

  initWindow();

  appIcon.on('click', function (e, bounds) {
    if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) return hideWindow();
    if (appIcon.window && appIcon.window.isVisible()) return hideWindow();
    bounds = bounds || cachedBounds;
    cachedBounds = bounds;
    showWindow(cachedBounds);
  });

  function initWindow () {
    var defaults = {
      width: 400,
      height: 350,
      show: false,
      frame: false,
      resizable: false,
      webPreferences: {
        overlayScrollbars: true
      }
    };

    appIcon.window = new BrowserWindow(defaults);
    appIcon.positioner = new Positioner(appIcon.window);
    appIcon.window.loadURL('file://' + __dirname + '/index.html');
    appIcon.window.on('blur', hideWindow);
    appIcon.window.setVisibleOnAllWorkspaces(true);

    initMenu();
    checkAutoUpdate(false);
  }

  function showWindow (trayPos) {
    var screen = electron.screen;
    var cursorPointer = screen.getCursorScreenPoint();
    var displaySize = screen.getPrimaryDisplay().workAreaSize;
    var x = (cursorPointer.x < (displaySize.width / 2)) ? 'left' : 'right';
    var y = (cursorPointer.y < (displaySize.height / 2)) ? 'top': 'bottom';

    var noBoundsPosition;
    if (x === 'right' && y === 'bottom') {
      noBoundsPosition = (isWindows) ? 'trayBottomCenter' : 'bottomRight';
    } else if (x === 'left' && y === 'bottom') {
      noBoundsPosition = 'bottomLeft';
    } else if (y === 'top') {
      noBoundsPosition = (isWindows) ? 'trayCenter' : 'topRight';
    }

    var position = appIcon.positioner.calculate(noBoundsPosition || windowPosition, trayPos);
    appIcon.window.setPosition(position.x, position.y);
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
    if (!appIcon.window) return;
    appIcon.window.hide();
  }

  function checkAutoUpdate(showAlert) {

    var autoUpdateOptions = {
      repo: 'ekonstantinidis/gitify',
      currentVersion: app.getVersion()
    };

    var update = new ghReleases(autoUpdateOptions, function (autoUpdater) {
      autoUpdater
        .on('error', function(event, message) {
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
        app.dock.hide();
      }

      if (!err && status) {
        update.download();
      }
    });
  }

  function confirmAutoUpdate(quitAndUpdate) {
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Update & Restart', 'Cancel'],
      title: 'Update Available',
      cancelId: 99,
      message: 'There is an update available. Would you like to update Gitify now?'
    }, function (response) {
      console.log('Exit: ' + response);
      app.dock.hide();
      if (response === 0) {
        quitAndUpdate();
      }
    } );
  }

  ipc.on('reopen-window', function() {
    showWindow(cachedBounds);
  });

  ipc.on('update-icon', function(event, arg) {
    if (arg === 'TrayActive') {
      appIcon.setImage(iconActive);
    } else {
      appIcon.setImage(iconIdle);
    }
  });

  ipc.on('startup-enable', function() {
    autoStart.enable();
  });

  ipc.on('startup-disable', function() {
    autoStart.disable();
  });

  ipc.on('check-update', function() {
    checkAutoUpdate(true);
  });

  ipc.on('app-quit', function() {
    app.quit();
  });

  appIcon.setToolTip('GitHub Notifications on your menu bar.');
});
