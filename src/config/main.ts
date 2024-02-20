import { initialize } from '@electron/remote/main';
import { app, ipcMain, nativeTheme } from 'electron';
import { autoUpdater } from 'electron-updater';
import { menubar } from 'menubar';
import path from 'path';
import { onFirstRunMaybe } from './first-run';

initialize();

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

const delayedHideAppIcon = () => {
  if (app.dock && app.dock.hide) {
    // Setting a timeout because the showDockIcon is not currently working
    // See more at https://github.com/maxogden/menubar/issues/306
    setTimeout(() => {
      app.dock.hide();
    }, 1500);
  }
};

app.on('ready', async () => {
  await onFirstRunMaybe();
});

const windowPath = MAIN_WINDOW_VITE_DEV_SERVER_URL
  ? MAIN_WINDOW_VITE_DEV_SERVER_URL
  : path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);

const menubarApp = menubar({
  icon: iconIdle,
  index: windowPath,
  browserWindow: browserWindowOpts,
  preloadWindow: true,
});

menubarApp.on('ready', () => {
  delayedHideAppIcon();

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

  menubarApp.window.webContents.openDevTools();
});

// TODO: Above is what we have in our main.js file. Below is what came in the template for this. Most of it is not necessary, but maybe some parts are important.
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

// const createWindow = () => {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//     },
//   });

//   // and load the index.html of the app.
//   if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
//     mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
//   } else {
//     mainWindow.loadFile(
//       path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
//     );
//   }

//   // Open the DevTools.
//   mainWindow.webContents.openDevTools();
// };

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
