const { app, dialog, ipcMain, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');
const AutoLaunch = require('auto-launch');
const GhReleases = require('electron-gh-releases');
const Positioner = require('electron-positioner');

const iconIdle = path.join(__dirname, 'images', 'tray-idleTemplate.png');
const iconActive = path.join(__dirname, 'images', 'tray-active.png');

const isDarwin = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
const isWindows = process.platform === 'win32';

let appWindow;
let isQuitting = false;

const autoStart = new AutoLaunch({
  name: 'Gitify',
  path: process.execPath.match(/.*?\.app/)[0],
  isHidden: true,
});

app.on('ready', () => {
  let appIcon = null;
  let positioner;

  function createAppIcon() {
    const trayIcon = new Tray(iconIdle);
    trayIcon.setIgnoreDoubleClickEvents(true);

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
        console.log('Exit: ' + response);
        app.dock.hide();
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
      repo: 'manosim/gitify',
      currentVersion: app.getVersion(),
    };

    const updater = new GhReleases(autoUpdateOptions);

    updater.on('error', (event, message) => {
      console.log('ERRORED.');
      console.log('Event: ' + JSON.stringify(event) + '. MESSAGE: ' + message);
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
        app.dock.hide();
      }

      if (!err && status) {
        updater.download();
      }
    });
  }

  function initWindow() {
    let defaults = {
      width: 500,
      height: 400,
      minWidth: 500,
      minHeight: 400,
      show: false,
      fullscreenable: false,
      frame: false,
      webPreferences: {
        overlayScrollbars: true,
        nodeIntegration: true,
      },
    };

    appWindow = new BrowserWindow(defaults);
    positioner = new Positioner(appWindow);
    appWindow.loadURL(`file://${__dirname}/index.html`);

    appWindow.once('ready-to-show', () => {
      appWindow.show();
    });

    appWindow.on('blur', hideWindow);

    appWindow.on('close', event => {
      if (!isQuitting) {
        event.preventDefault();
        hideWindow();
      }
    });

    function hideWindow() {
      if (!appWindow) {
        return;
      }
      appWindow.hide();
    }

    checkAutoUpdate(false);
  }

  appIcon = createAppIcon();
  initWindow();
  positioner.move('trayCenter', appIcon.getBounds());

  ipcMain.on('reopen-window', () => appWindow.show());
  ipcMain.on('startup-enable', () => autoStart.enable());
  ipcMain.on('startup-disable', () => autoStart.disable());
  ipcMain.on('check-update', () => checkAutoUpdate(true));
  ipcMain.on('set-badge', (_, count) => {
    app.badgeCount = count;
  });
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
