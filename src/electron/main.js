const {
  ipcMain: ipc,
  app,
  nativeTheme,
  globalShortcut,
  Menu,
  dialog,
} = require('electron/main');
const { menubar } = require('menubar');
const { updateElectronApp } = require('update-electron-app');
const { onFirstRunMaybe } = require('./first-run');
const path = require('node:path');
const log = require('electron-log');
const fs = require('node:fs');
const os = require('node:os');
const { autoUpdater } = require('electron');

log.initialize();

// TODO: Remove @electron/remote use - see #650
require('@electron/remote/main').initialize();

// Tray Icons
const idleIcon = path.resolve(
  `${__dirname}/../../assets/images/tray-idleTemplate.png`,
);
const idleUpdateAvailableIcon = path.resolve(
  `${__dirname}/../../assets/images/tray-idle-update.png`,
);
const activeIcon = path.resolve(
  `${__dirname}/../../assets/images/tray-active.png`,
);
const activeUpdateAvailableIcon = path.resolve(
  `${__dirname}/../../assets/images/tray-active-update.png`,
);

const browserWindowOpts = {
  width: 500,
  height: 400,
  minWidth: 500,
  minHeight: 400,
  resizable: false,
  webPreferences: {
    enableRemoteModule: true,
    nodeIntegration: true,
    contextIsolation: false,
  },
};

let isUpdateAvailable = true;

const contextMenu = Menu.buildFromTemplate([
  {
    label: 'Check for updates',
    enabled: !isUpdateAvailable,
    click: () => {
      autoUpdater.checkForUpdates();
    },
  },
  { type: 'separator' },
  {
    label: 'Developer',
    submenu: [
      {
        role: 'reload',
        accelerator: 'CommandOrControl+R',
      },
      {
        role: 'toggleDevTools',
        accelerator:
          process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
      },
      {
        label: 'Take Screenshot',
        accelerator: 'CommandOrControl+S',
        click: () => takeScreenshot(),
      },
      {
        label: 'Reset App',
        click: () => {
          resetApp();
        },
      },
    ],
  },
  { type: 'separator' },
  {
    label: 'Quit Gitify',
    accelerator: 'CommandOrControl+Q',
    click: () => {
      app.quit();
    },
  },
]);

const mb = menubar({
  icon: idleIcon,
  index: `file://${__dirname}/index.html`,
  browserWindow: browserWindowOpts,
  preloadWindow: true,
  showDockIcon: false,
});

app.whenReady().then(async () => {
  await onFirstRunMaybe();

  mb.on('ready', () => {
    mb.app.setAppUserModelId('com.electron.gitify');

    // Tray configuration
    mb.tray.setToolTip('Gitify');
    mb.tray.setIgnoreDoubleClickEvents(true);
    mb.tray.on('right-click', (_event, bounds) => {
      mb.tray.popUpContextMenu(contextMenu, { x: bounds.x, y: bounds.y });
    });

    // Custom key events
    mb.window.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape') {
        mb.window.hide();
        event.preventDefault();
      }
    });

    // DevTools configuration
    mb.window.webContents.on('devtools-opened', () => {
      mb.window.setSize(800, 600);
      mb.window.center();
      mb.window.resizable = true;
      mb.window.setAlwaysOnTop(true);
    });

    mb.window.webContents.on('devtools-closed', () => {
      const trayBounds = mb.tray.getBounds();
      mb.window.setSize(browserWindowOpts.width, browserWindowOpts.height);
      mb.positioner.move('trayCenter', trayBounds);
      mb.window.resizable = false;
    });
  });

  nativeTheme.on('updated', () => {
    if (nativeTheme.shouldUseDarkColors) {
      mb.window.webContents.send('gitify:update-theme', 'DARK');
    } else {
      mb.window.webContents.send('gitify:update-theme', 'LIGHT');
    }
  });

  /**
   * Gitify custom IPC events
   */
  ipc.handle('gitify:version', () => app.getVersion());

  ipc.on('gitify:window-show', () => mb.showWindow());

  ipc.on('gitify:window-hide', () => mb.hideWindow());

  ipc.on('gitify:quit', () => mb.app.quit());

  ipc.on('gitify:icon-active', () => {
    if (!mb.tray.isDestroyed()) {
      mb.tray.setImage(
        isUpdateAvailable ? activeUpdateAvailableIcon : activeIcon,
      );
    }
  });

  ipc.on('gitify:icon-idle', () => {
    if (!mb.tray.isDestroyed()) {
      mb.tray.setImage(isUpdateAvailable ? idleUpdateAvailableIcon : idleIcon);
    }
  });

  ipc.on('gitify:update-title', (_, title) => {
    if (!mb.tray.isDestroyed()) {
      mb.tray.setTitle(title);
    }
  });

  ipc.on(
    'gitify:update-keyboard-shortcut',
    (_, { enabled, keyboardShortcut }) => {
      if (!enabled) {
        globalShortcut.unregister(keyboardShortcut);
        return;
      }

      globalShortcut.register(keyboardShortcut, () => {
        if (mb.window.isVisible()) {
          mb.hideWindow();
        } else {
          mb.showWindow();
        }
      });
    },
  );

  ipc.on('gitify:update-auto-launch', (_, settings) => {
    app.setLoginItemSettings(settings);
  });

  // Auto Updater
  updateElectronApp({
    updateInterval: '24 hours',
    logger: log,
  });

  autoUpdater.on('update-available', () => {
    log.info('Auto Updater: New update available');
    isUpdateAvailable = true;
    mb.tray.setToolTip('Gitify - New update available 🚀');
  });
});

function takeScreenshot() {
  const date = new Date();
  const dateStr = date.toISOString().replace(/:/g, '-');

  const capturedPicFilePath = `${os.homedir()}/${dateStr}-gitify-screenshot.png`;
  mb.window.capturePage().then((img) => {
    fs.writeFile(capturedPicFilePath, img.toPNG(), () =>
      log.info(`Screenshot saved ${capturedPicFilePath}`),
    );
  });
}

function resetApp() {
  const cancelButtonId = 0;

  const response = dialog.showMessageBoxSync(mb.window, {
    type: 'warning',
    title: 'Reset Gitify',
    message:
      'Are you sure you want to reset Gitify? You will be logged out of all accounts',
    buttons: ['Cancel', 'Reset'],
    defaultId: cancelButtonId,
    cancelId: cancelButtonId,
  });

  if (response === cancelButtonId) {
    return;
  }

  mb.window.webContents.send('gitify:reset-app');
  mb.app.quit();
}
