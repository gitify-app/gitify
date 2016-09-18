const { app, dialog, ipcMain, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');
const GhReleases = require('electron-gh-releases');
const AutoLaunch = require('auto-launch');

const menuTemplate = require('./menu-template');
const iconIdle = path.join(__dirname, 'images', 'tray-idleTemplate.png');
const iconActive = path.join(__dirname, 'images', 'tray-active.png');

const isDarwin = (process.platform === 'darwin');
const isLinux = (process.platform === 'linux');
const isWindows = (process.platform === 'win32');

let appWindow;
let isQuitting = false;

const autoStart = new AutoLaunch({
  name: 'Gitify',
  path: process.execPath.match(/.*?\.app/)[0],
  isHidden: true
});

app.on('ready', function() {
  let appIcon = new Tray(iconIdle);

  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Show Gitify',
      click () { appWindow.show(); }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      accelerator: isDarwin ? 'Command+Q' : 'Alt+F4',
      role: 'quit'
    }
  ]);

  appIcon.setToolTip('GitHub Notifications on your menu bar.');
  appIcon.setContextMenu(trayMenu);

  function confirmAutoUpdate(updater) {
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Update & Restart', 'Cancel'],
      title: 'Update Available',
      cancelId: 99,
      message: 'There is an update available. Would you like to update Gitify now?'
    }, function (response) {
      console.log('Exit: ' + response);
      if (response === 0) {
        updater.install();
      }
    } );
  }

  function checkAutoUpdate(showAlert) {

    if (isWindows || isLinux) { return; }

    let autoUpdateOptions = {
      repo: 'ekonstantinidis/gitify',
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
      }

      if (!err && status) {
        updater.download();
      }
    });
  }

  function initWindow () {
    var defaults = {
      width: 800,
      height: 600,
      show: false,
      center: true,
      fullscreenable: false,
      titleBarStyle: 'hidden-inset',
      webPreferences: {
        overlayScrollbars: true
      }
    };

    appWindow = new BrowserWindow(defaults);
    appWindow.loadURL('file://' + __dirname + '/index.html');
    appWindow.show();

    appWindow.on('close', function (event) {
      if (!isQuitting) {
        event.preventDefault();
        appWindow.hide();
      }
    });

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    checkAutoUpdate(false);
  }

  initWindow();

  ipcMain.on('reopen-window', () => appWindow.show() );
  ipcMain.on('startup-enable', () => autoStart.enable() );
  ipcMain.on('startup-disable', () => autoStart.disable() );
  ipcMain.on('check-update', () => checkAutoUpdate(true) );
  ipcMain.on('app-quit', () => app.quit() );
  ipcMain.on('update-icon', (event, arg) => {
    if (arg === 'TrayActive') {
      appIcon.setImage(iconActive);
    } else {
      appIcon.setImage(iconIdle);
    }
  });

});

app.on('activate', () => appWindow.show() );

app.on('window-all-closed', () => {
  if (!isDarwin) {
    app.quit();
  }
});

app.on('before-quit', (event) => {
  isQuitting = true;
});
