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

let appBrowserWindow;
let isQuitting = false;

const autoStart = new AutoLaunch({
  name: 'Gitify',
  path: process.execPath.match(/.*?\.app/)[0],
  isHidden: true,
});

app.on('ready', () => {
  let appTrayIcon = null;
  let positioner;

  function createAppIcon() {
    const trayIcon = new Tray(iconIdle);
    trayIcon.setIgnoreDoubleClickEvents(true);

    const trayMenu = Menu.buildFromTemplate([
      {
        label: 'Show Gitify',
        click() {
          appBrowserWindow.show();
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
        appBrowserWindow.isFocused()
          ? appBrowserWindow.hide()
          : appBrowserWindow.show();
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

    appBrowserWindow = new BrowserWindow(defaults);
    positioner = new Positioner(appBrowserWindow);
    appBrowserWindow.loadURL(`file://${__dirname}/index.html`);

    appBrowserWindow.once('ready-to-show', () => {
      appBrowserWindow.show();
    });

    appBrowserWindow.on('blur', hideWindow);

    appBrowserWindow.on('close', event => {
      if (!isQuitting) {
        event.preventDefault();
        hideWindow();
      }
    });

    function hideWindow() {
      if (!appBrowserWindow) {
        return;
      }
      appBrowserWindow.hide();
    }

    checkAutoUpdate(false);
  }

  appTrayIcon = createAppIcon();
  initWindow();
  positioner.move('trayCenter', appTrayIcon.getBounds());

  ipcMain.on('reopen-window', () => appBrowserWindow.show());
  ipcMain.on('startup-enable', () => autoStart.enable());
  ipcMain.on('startup-disable', () => autoStart.disable());
  ipcMain.on('check-update', () => checkAutoUpdate(true));
  ipcMain.on('app-quit', () => app.quit());

  ipcMain.on('update-icon', (event, arg) => {
    if (!appTrayIcon.isDestroyed()) {
      if (arg === 'TrayActive') {
        appTrayIcon.setImage(iconActive);
      } else {
        appTrayIcon.setImage(iconIdle);
      }
    }
  });
});

app.on('activate', () => appBrowserWindow.show());

app.on('window-all-closed', () => {
  if (!isDarwin) {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});
