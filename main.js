const { app, dialog, ipcMain, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');
const GhReleases = require('electron-gh-releases');
const AutoLaunch = require('auto-launch');

const appMenuTemplate = require('./electron/app-menu-template');
const iconIdle = path.join(__dirname, 'images', 'tray-idleTemplate.png');
const iconActive = path.join(__dirname, 'images', 'tray-active.png');

const isDarwin = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
const isWindows = process.platform === 'win32';

let appWindow;
let appIcon = null;
let isQuitting = false;

const autoStart = new AutoLaunch({
  name: 'Gitify',
  path: process.execPath.match(/.*?\.app/)[0],
  isHidden: true,
});

app.on('ready', function() {
  function createAppIcon() {
    let trayIcon = new Tray(iconIdle);

    const trayMenu = Menu.buildFromTemplate([
      {
        label: 'Show Gitify',
        click() {
          appWindow.show();
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        accelerator: isDarwin ? 'Command+Q' : 'Alt+F4',
        role: 'quit',
      },
    ]);

    trayIcon.setToolTip('GitHub Notifications on your menu bar.');

    if (isLinux) {
      trayIcon.setContextMenu(trayMenu);
    } else {
      trayIcon.on('click', () => {
        appWindow.isFocused() ? appWindow.hide() : appWindow.show();
      });
    }

    return trayIcon;
  }

  function confirmAutoUpdate(updater) {
    dialog.showMessageBox(
      {
        type: 'question',
        buttons: ['Update & Restart', 'Cancel'],
        title: 'Update Available',
        cancelId: 99,
        message:
          'There is an update available. Would you like to update Gitify now?',
      },
      response => {
        console.log('Exit: ' + response); // eslint-disable-line no-console

        if (response === 0) {
          updater.install();
        }
      }
    );
  }

  function checkAutoUpdate(showAlert) {
    if (isWindows || isLinux) {
      return;
    }

    let autoUpdateOptions = {
      repo: 'Two15/gitify',
      currentVersion: app.getVersion(),
    };

    const updater = new GhReleases(autoUpdateOptions);

    updater.on('error', (event, message) => {
      /* eslint-disable no-console */
      console.log('ERRORED.');
      console.log('Event: ' + JSON.stringify(event) + '. MESSAGE: ' + message);
      /* eslint-enable no-console */
    });

    updater.on('update-downloaded', () => {
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
            message: 'You are currently running the latest version of Gitify.',
          });
        }
      }

      if (!err && status) {
        updater.download();
      }
    });
  }

  function initWindow() {
    let defaults = {
      width: 500,
      height: 600,
      minHeight: 300,
      minWidth: 500,
      show: false,
      center: true,
      fullscreenable: false,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        overlayScrollbars: true,
      },
    };

    appWindow = new BrowserWindow(defaults);
    appWindow.loadURL('file://' + __dirname + '/index.html');
    appWindow.show();

    appWindow.on('close', function(event) {
      if (!isQuitting) {
        event.preventDefault();
        appWindow.hide();
      }
    });

    const menu = Menu.buildFromTemplate(appMenuTemplate);
    Menu.setApplicationMenu(menu);
    checkAutoUpdate(false);
  }

  appIcon = createAppIcon();
  initWindow();

  ipcMain.on('reopen-window', () => appWindow.show());
  ipcMain.on('startup-enable', () => autoStart.enable());
  ipcMain.on('startup-disable', () => autoStart.disable());
  ipcMain.on('check-update', () => checkAutoUpdate(true));
  ipcMain.on('set-badge', (event, count) => app.setBadgeCount(count));
  ipcMain.on('app-quit', () => app.quit());

  ipcMain.on('update-icon', (event, arg) => {
    if (!appIcon.isDestroyed()) {
      if (arg === 'TrayActive') {
        appIcon.setImage(iconActive);
      } else {
        appIcon.setImage(iconIdle);
      }
    }
  });

  ipcMain.on('show-app-icon', (event, arg) => {
    switch (arg) {
      case 'both':
        app.dock.show();
        if (appIcon.isDestroyed()) {
          appIcon = createAppIcon();
        }
        break;

      case 'tray':
        app.dock.hide();
        if (appIcon.isDestroyed()) {
          appIcon = createAppIcon();
        }
        break;

      case 'dock':
        app.dock.show();
        if (!appIcon.isDestroyed()) {
          appIcon.destroy();
        }
        break;
    }
  });
});

app.on('activate', () => appWindow.show());

app.on('window-all-closed', () => {
  if (!isDarwin) {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});
