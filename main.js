const path = require('path');
const open = require('open');
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const Tray = electron.Tray;
const app = electron.app;
const dialog = electron.dialog;
const ipc = electron.ipcMain;

const GhReleases = require('electron-gh-releases');
var Positioner = require('electron-positioner');

var AutoLaunch = require('auto-launch');

var iconIdle = path.join(__dirname, 'images', 'tray-idleTemplate.png');
var iconActive = path.join(__dirname, 'images', 'tray-active.png');

// Utilities
var isDarwin = (process.platform === 'darwin');
var isLinux = (process.platform === 'linux');
var isWindows = (process.platform === 'win32');

var autoStart = new AutoLaunch({
  name: 'Gitify',
  path: process.execPath.match(/.*?\.app/)[0],
  isHidden: true
});

app.on('ready', function() {
  var cachedBounds;
  var appIcon = new Tray(iconIdle);
  var windowPosition = (isWindows) ? 'trayBottomCenter' : 'trayCenter';

  function confirmAutoUpdate(updater) {
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
        updater.install();
      }
    } );
  }

  function checkAutoUpdate(showAlert) {

    let autoUpdateOptions = {
      repo: 'manosim/gitify',
      currentVersion: app.getVersion()
    };

    const updater = new GhReleases(autoUpdateOptions);

    updater.on('error', (event, message) => {
      console.log('ERRORED.');
      console.log('Event: ' + JSON.stringify(event) + '. MESSAGE: ' + message);
    });

    updater.on('update-downloaded', (info) => {
      // Restart the app(ask) and install the update
      confirmAutoUpdate(updater);
    });

    // Check for updates
    updater.check((err, status) => {
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
        updater.download();
      }
    });
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
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            };
          }
        },
      ]
    }];

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  function hideWindow () {
    if (!appIcon.window) { return; }
    appIcon.window.hide();
  }

  function initWindow () {
    var defaults = {
      width: 400,
      height: 380,
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

    appIcon.window.webContents.on('new-window', function(event, url){
      event.preventDefault();
      open(url);
    });

    appIcon.window.webContents.on('devtools-opened', (event, deviceList, callback) => {
      appIcon.window.setSize(800, 600);
      appIcon.window.setResizable(true);
    });

    appIcon.window.webContents.on('devtools-closed', (event, deviceList, callback) => {
      appIcon.window.setSize(400, 350);
      appIcon.window.setResizable(false);
    });

    initMenu();
    checkAutoUpdate(false);
  }

  function showWindow (trayPos) {
    var noBoundsPosition;
    if (!isDarwin && trayPos !== undefined) {
      var displaySize = electron.screen.getPrimaryDisplay().workAreaSize;
      var trayPosX = trayPos.x;
      var trayPosY = trayPos.y;

      if (isLinux) {
        var cursorPointer = electron.screen.getCursorScreenPoint();
        trayPosX = cursorPointer.x;
        trayPosY = cursorPointer.y;
      }

      var x = (trayPosX < (displaySize.width / 2)) ? 'left' : 'right';
      var y = (trayPosY < (displaySize.height / 2)) ? 'top' : 'bottom';

      if (x === 'right' && y === 'bottom') {
        noBoundsPosition = (isWindows) ? 'trayBottomCenter' : 'bottomRight';
      } else if (x === 'left' && y === 'bottom') {
        noBoundsPosition = 'bottomLeft';
      } else if (y === 'top') {
        noBoundsPosition = (isWindows) ? 'trayCenter' : 'topRight';
      }
    } else if (trayPos === undefined) {
      noBoundsPosition = (isWindows) ? 'bottomRight' : 'topRight';
    }

    var position = appIcon.positioner.calculate(noBoundsPosition || windowPosition, trayPos);
    appIcon.window.setPosition(position.x, position.y);
    appIcon.window.show();
  }

  initWindow();

  appIcon.on('click', function (e, bounds) {
    if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) { return hideWindow(); };
    if (appIcon.window && appIcon.window.isVisible()) { return hideWindow(); };
    bounds = bounds || cachedBounds;
    cachedBounds = bounds;
    showWindow(cachedBounds);
  });

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
