const { ipcMain, app, nativeTheme } = require('electron');
const { menubar } = require('menubar');
const { autoUpdater } = require('electron-updater');
const { onFirstRunMaybe } = require('./first-run');
const path = require('path');

require('@electron/remote/main').initialize();

app.setAppUserModelId('com.electron.gitify');

const iconIdle = path.join(
  __dirname,
  'assets',
  'images',
  'tray-idleTemplate.png',
);
const iconActive = path.join(__dirname, 'assets', 'images', 'tray-active.png');

const browserWindowOpts = {
  width: 500,
  height: 400,
  minWidth: 500,
  minHeight: 400,
  resizable: false,
  webPreferences: {
    enableRemoteModule: true,
    overlayScrollbars: true,
    nodeIntegration: true,
    contextIsolation: false,
  },
};

app.on('ready', async () => {
  await onFirstRunMaybe();
});

const menubarApp = menubar({
  icon: iconIdle,
  index: `file://${__dirname}/index.html`,
  browserWindow: browserWindowOpts,
  preloadWindow: true,
  showDockIcon: false,
});

menubarApp.on('ready', () => {
  menubarApp.tray.setIgnoreDoubleClickEvents(true);

  autoUpdater.checkForUpdatesAndNotify();

  nativeTheme.on('updated', () => {
    if (nativeTheme.shouldUseDarkColors) {
      menubarApp.window.webContents.send('update-native-theme', 'DARK');
    } else {
      menubarApp.window.webContents.send('update-native-theme', 'LIGHT');
    }
  });

  ipcMain.handle('get-platform', async () => {
    return process.platform;
  });
  ipcMain.handle('get-app-version', async () => {
    return app.getVersion();
  });

  ipcMain.on('reopen-window', () => menubarApp.showWindow());
  ipcMain.on('hide-window', () => menubarApp.hideWindow());

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
  ipcMain.on('update-title', (_, title) => {
    if (!menubarApp.tray.isDestroyed()) {
      menubarApp.tray.setTitle(title);
    }
  });
  ipcMain.on('set-login-item-settings', (event, settings) => {
    app.setLoginItemSettings(settings);
  });

  menubarApp.window.webContents.on('devtools-opened', () => {
    menubarApp.window.setSize(800, 600);
    menubarApp.window.center();
    menubarApp.window.resizable = true;
  });

  menubarApp.window.webContents.on('devtools-closed', () => {
    const trayBounds = menubarApp.tray.getBounds();
    menubarApp.window.setSize(
      browserWindowOpts.width,
      browserWindowOpts.height,
    );
    menubarApp.positioner.move('trayCenter', trayBounds);
    menubarApp.window.resizable = false;
  });

  menubarApp.window.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      menubarApp.window.hide();
      event.preventDefault();
    }
  });
});
