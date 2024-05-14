const { ipcMain: ipc, app, nativeTheme } = require('electron');
const { menubar } = require('menubar');
const { autoUpdater } = require('electron-updater');
const { onFirstRunMaybe } = require('./first-run');
const path = require('node:path');

require('@electron/remote/main').initialize();

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

const mb = menubar({
  icon: iconIdle,
  index: `file://${__dirname}/index.html`,
  browserWindow: browserWindowOpts,
  preloadWindow: true,
  showDockIcon: false,
});

mb.on('ready', () => {
  require('@electron/remote/main').enable(mb.window.webContents);

  mb.app.setAppUserModelId('com.electron.gitify');
  mb.tray.setIgnoreDoubleClickEvents(true);
  // Force the window to retrieve its previous zoom factor
  mb.window.webContents.setZoomFactor(mb.window.webContents.getZoomFactor());

  mb.window.webContents.on('devtools-opened', () => {
    mb.window.setSize(800, 600);
    mb.window.center();
    mb.window.resizable = true;
  });

  mb.window.webContents.on('devtools-closed', () => {
    const trayBounds = mb.tray.getBounds();
    mb.window.setSize(browserWindowOpts.width, browserWindowOpts.height);
    mb.positioner.move('trayCenter', trayBounds);
    mb.window.resizable = false;
  });

  mb.window.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      mb.window.hide();
      event.preventDefault();
    }
  });

  autoUpdater.checkForUpdatesAndNotify();

  nativeTheme.on('updated', () => {
    if (nativeTheme.shouldUseDarkColors) {
      mb.window.webContents.send('update-native-theme', 'DARK');
    } else {
      mb.window.webContents.send('update-native-theme', 'LIGHT');
    }
  });

  ipc.handle('get-platform', () => process.platform);

  ipc.handle('get-app-version', () => app.getVersion());

  ipc.on('reopen-window', () => mb.showWindow());

  ipc.on('hide-window', () => mb.hideWindow());

  ipc.on('app-quit', () => mb.app.quit());

  ipc.on('update-icon', (_, arg) => {
    if (!mb.tray.isDestroyed()) {
      if (arg === 'TrayActive') {
        mb.tray.setImage(iconActive);
      } else {
        mb.tray.setImage(iconIdle);
      }
    }
  });

  ipc.on('update-title', (_, title) => {
    if (!mb.tray.isDestroyed()) {
      mb.tray.setTitle(title);
    }
  });

  ipc.on('set-login-item-settings', (_, settings) => {
    app.setLoginItemSettings(settings);
  });
});
