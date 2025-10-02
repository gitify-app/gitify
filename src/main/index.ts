import path from 'node:path';

import {
  app,
  type BrowserWindowConstructorOptions,
  globalShortcut,
  safeStorage,
  shell,
} from 'electron';
import log from 'electron-log';
import { menubar } from 'menubar';

import { APPLICATION } from '../shared/constants';
import {
  EVENTS,
  type IAutoLaunch,
  type IKeyboardShortcut,
  type IOpenExternal,
} from '../shared/events';
import { logInfo, logWarn } from '../shared/logger';
import { isLinux, isWindows } from '../shared/platform';

import { handleMainEvent, onMainEvent, sendRendererEvent } from './events';
import { onFirstRunMaybe } from './first-run';
import { TrayIcons } from './icons';
import MenuBuilder from './menu';
import AppUpdater from './updater';

log.initialize();

/**
 * File paths
 */
const preloadFilePath = path.join(__dirname, 'preload.js');
const indexHtmlFilePath = `file://${__dirname}/index.html`;
const notificationSoundFilePath = path.join(
  __dirname,
  '..',
  'assets',
  'sounds',
  APPLICATION.NOTIFICATION_SOUND,
);
const twemojiDirPath = path.join(__dirname, 'images', 'twemoji');

const browserWindowOpts: BrowserWindowConstructorOptions = {
  width: 500,
  height: 400,
  minWidth: 500,
  minHeight: 400,
  resizable: false,
  skipTaskbar: true, // Hide the app from the Windows taskbar
  webPreferences: {
    preload: preloadFilePath,
    contextIsolation: true,
    nodeIntegration: false,
  },
};

const mb = menubar({
  icon: TrayIcons.idle,
  index: indexHtmlFilePath,
  browserWindow: browserWindowOpts,
  preloadWindow: true,
  showDockIcon: false, // Hide the app from the macOS dock
});

const menuBuilder = new MenuBuilder(mb);
const contextMenu = menuBuilder.buildMenu();

// Register your app as the handler for a custom protocol
const protocol =
  process.env.NODE_ENV === 'development' ? 'gitify-dev' : 'gitify';
app.setAsDefaultProtocolClient(protocol);

const appUpdater = new AppUpdater(mb, menuBuilder);

let shouldUseAlternateIdleIcon = false;
let shouldUseUnreadActiveIcon = false;

app.whenReady().then(async () => {
  await onFirstRunMaybe();

  appUpdater.start();

  mb.on('ready', () => {
    mb.app.setAppUserModelId(APPLICATION.ID);

    // Tray configuration
    mb.tray.setToolTip(APPLICATION.NAME);
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

  /** Prevent second instances */
  if (isWindows() || isLinux()) {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      logWarn('main:gotTheLock', 'Second instance detected, quitting');
      app.quit(); // Quit the second instance
      return;
    }

    app.on('second-instance', (_event, commandLine, _workingDirectory) => {
      logInfo(
        'main:second-instance',
        'Second instance was launched.  extracting command to forward',
      );

      // Get the URL from the command line arguments
      const url = commandLine.find((arg) => arg.startsWith(`${protocol}://`));

      if (url) {
        handleURL(url);
      }
    });
  }

  /**
   * Gitify custom IPC events - no response expected
   */
  onMainEvent(EVENTS.WINDOW_SHOW, () => mb.showWindow());

  onMainEvent(EVENTS.WINDOW_HIDE, () => mb.hideWindow());

  onMainEvent(EVENTS.QUIT, () => mb.app.quit());

  onMainEvent(EVENTS.OPEN_EXTERNAL, (_, { url, activate }: IOpenExternal) =>
    shell.openExternal(url, { activate: activate }),
  );

  onMainEvent(
    EVENTS.USE_ALTERNATE_IDLE_ICON,
    (_, useAlternateIdleIcon: boolean) => {
      shouldUseAlternateIdleIcon = useAlternateIdleIcon;
    },
  );

  onMainEvent(
    EVENTS.USE_UNREAD_ACTIVE_ICON,
    (_, useUnreadActiveIcon: boolean) => {
      shouldUseUnreadActiveIcon = useUnreadActiveIcon;

      if (!shouldUseUnreadActiveIcon) {
        setIdleIcon();
      }
    },
  );

  onMainEvent(EVENTS.ICON_ERROR, () => {
    if (!mb.tray.isDestroyed()) {
      mb.tray.setImage(TrayIcons.error);
    }
  });

  onMainEvent(EVENTS.ICON_ACTIVE, () => {
    if (!mb.tray.isDestroyed() && shouldUseUnreadActiveIcon) {
      mb.tray.setImage(
        menuBuilder.isUpdateAvailable()
          ? TrayIcons.activeWithUpdate
          : TrayIcons.active,
      );
    }
  });

  onMainEvent(EVENTS.ICON_IDLE, () => {
    if (!mb.tray.isDestroyed()) {
      setIdleIcon();
    }
  });

  onMainEvent(EVENTS.UPDATE_TITLE, (_, title: string) => {
    if (!mb.tray.isDestroyed()) {
      mb.tray.setTitle(title);
    }
  });

  onMainEvent(
    EVENTS.UPDATE_KEYBOARD_SHORTCUT,
    (_, { enabled, keyboardShortcut }: IKeyboardShortcut) => {
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

  onMainEvent(EVENTS.UPDATE_AUTO_LAUNCH, (_, settings: IAutoLaunch) => {
    app.setLoginItemSettings(settings);
  });

  /**
   * Gitify custom IPC events - response expected
   */

  handleMainEvent(EVENTS.VERSION, () => app.getVersion());

  handleMainEvent(EVENTS.NOTIFICATION_SOUND_PATH, () => {
    return notificationSoundFilePath;
  });

  handleMainEvent(EVENTS.TWEMOJI_DIRECTORY, () => {
    return twemojiDirPath;
  });

  handleMainEvent(EVENTS.SAFE_STORAGE_ENCRYPT, (_, value: string) => {
    return safeStorage.encryptString(value).toString('base64');
  });

  handleMainEvent(EVENTS.SAFE_STORAGE_DECRYPT, (_, value: string) => {
    return safeStorage.decryptString(Buffer.from(value, 'base64'));
  });
});

// Handle gitify:// custom protocol URL events for OAuth 2.0 callback
app.on('open-url', (event, url) => {
  event.preventDefault();
  logInfo('main:open-url', `URL received ${url}`);
  handleURL(url);
});

const handleURL = (url: string) => {
  if (url.startsWith(`${protocol}://`)) {
    logInfo('main:handleUrl', `forwarding URL ${url} to renderer process`);
    sendRendererEvent(mb, EVENTS.AUTH_CALLBACK, url);
  }
};

function setIdleIcon() {
  if (shouldUseAlternateIdleIcon) {
    mb.tray.setImage(
      menuBuilder.isUpdateAvailable()
        ? TrayIcons.idleAlternateWithUpdate
        : TrayIcons.idleAlternate,
    );
  } else {
    mb.tray.setImage(
      menuBuilder.isUpdateAvailable()
        ? TrayIcons.idleWithUpdate
        : TrayIcons.idle,
    );
  }
}
