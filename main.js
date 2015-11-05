var menubar = require('menubar');
var path = require('path');
var ipc = require('ipc');

require('crash-reporter').start();

var AutoLaunch = require('auto-launch');
var dialog = require('dialog');

// Status icons
var iconIdle = path.join(__dirname, 'images', 'tray-idleTemplate.png');
var iconActive = path.join(__dirname, 'images', 'tray-active.png');

// Utilities
var isLinux = (process.platform === 'linux');
var isDarwin = (process.platform === 'darwin');
var isWindows = (process.platform === 'win32');

// The auto-start module does not support Linux
if (!isLinux) {
  var autoStart = new AutoLaunch({
    name: 'Gitify',
    path: process.execPath.match(/.*?\.app/)
  });
}

// Create menu
var mb = menubar({
  index: 'file://' + __dirname + '/index.html',
  icon: iconIdle,
  preloadWindow: true,
  width: 420,
  height: 370,
  resizable: false,
  'standard-window': false
});

// Application code
mb.on('ready', function () {
  // Auto-update not working on Linux and Windows
  if (isDarwin) {
    checkAutoUpdate(false);
  }

  this.on('show', function () {
    var screen = require('screen');
    var cursorPointer = screen.getCursorScreenPoint();
    var displaySize = screen.getPrimaryDisplay().workAreaSize;

    // Determination of the position of the pane with an icon
    var x = (cursorPointer.x < (displaySize.width / 2)) ? 'left' : 'right';
    var y = (cursorPointer.y < (displaySize.height / 2)) ? 'top' : 'bottom';

    // If click was made above middle (axis X and Y), then recalculate window position
    if (x === 'right' && y === 'bottom') {
      mb.setOption('window-position', (isWindows) ? 'trayBottomCenter' : 'bottomRight');
    } else if (x === 'right' && y === 'top') {
      mb.setOption('window-position', 'trayCenter');
    } else if (x === 'left' && y === 'bottom') {
      mb.setOption('window-position', 'bottomLeft');
    } else if (x === 'left' && y === 'top') {
      mb.setOption('window-position', 'trayCenter');
    }
  });

  function checkAutoUpdate (showAlert) {
    var autoUpdateOptions = {
      repo: 'ekonstantinidis/gitify',
      currentVersion: mb.app.getVersion()
    };

    var ghReleases = require('electron-gh-releases');
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
          mb.app.dock.hide();
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
        mb.app.dock.hide();
      }

      if (response === 0) {
        quitAndUpdate();
      }
    });
  }

  ipc.on('reopen-window', function () {
    mb.window.show();
  });

  ipc.on('update-icon', function (event, arg) {
    if (arg === 'TrayActive') {
      mb.tray.setImage(iconActive);
    } else {
      mb.tray.setImage(iconIdle);
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
    mb.app.quit();
  });

  mb.tray.setToolTip('GitHub Notifications on your menu bar.');
});
