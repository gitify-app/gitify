const { dialog, ipcMain } = require('electron');
const { menubar } = require('menubar');
const path = require('path');
const AutoLaunch = require('auto-launch');
const GhReleases = require('electron-gh-releases');

const iconIdle = path.join(__dirname, 'images', 'tray-idleTemplate.png');
const iconActive = path.join(__dirname, 'images', 'tray-active.png');

const isDarwin = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
const isWindows = process.platform === 'win32';

const autoStart = new AutoLaunch({
  name: 'Gitify',
  path: process.execPath.match(/.*?\.app/)[0],
  isHidden: true,
});

const browserWindowOpts = {
  width: 500,
  height: 400,
  minWidth: 500,
  minHeight: 400,
  resizable: false,
  webPreferences: {
    overlayScrollbars: true,
    nodeIntegration: true,
  },
};

const menubarApp = menubar({
  icon: iconIdle,
  index: `file://${__dirname}/index.html`,
  browserWindow: browserWindowOpts,
  preloadWindow: true,
});

menubarApp.on('ready', () => {
  menubarApp.tray.setIgnoreDoubleClickEvents(true);

  checkAutoUpdate();

  ipcMain.on('reopen-window', () => menubarApp.showWindow());
  ipcMain.on('startup-enable', () => autoStart.enable());
  ipcMain.on('startup-disable', () => autoStart.disable());
  ipcMain.on('app-quit', () => menubarApp.app.quit());
  ipcMain.on('update-icon', (_, arg) => {
    if (!menubarApp.tray.isDestroyed()) {
      if (arg === 'TrayActive') {
        menubarApp.tray.setImage(iconActive);
      } else {
        menubarApp.tray.setImage(iconIdle);
      }
    }
  });

  function checkAutoUpdate() {
    if (isWindows || isLinux) {
      return;
    }

    let autoUpdateOptions = {
      repo: 'manosim/gitify',
      currentVersion: menubarApp.app.getVersion(),
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
      if (!err && status) {
        updater.download();
      }
    });
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
        menubarApp.app.dock.hide();
        if (response === 0) {
          updater.install();
        }
      }
    );
  }
});
