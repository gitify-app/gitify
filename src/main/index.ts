import { app } from 'electron';
import log from 'electron-log';
import { menubar } from 'electron-menubar';

import { logError, toError } from '../shared/logger';

import { Paths, WindowConfig } from './config';
import { installMainDiagnostics } from './diagnostics';
import {
  registerAppHandlers,
  registerGitHubCliHandlers,
  registerNativeNotificationHandlers,
  registerStorageHandlers,
  registerSystemHandlers,
  registerTrayHandlers,
  registerUpdaterHandlers,
} from './handlers';
import { getIdleTrayIcon } from './icons';
import {
  configureUserDataPath,
  configureWindowEvents,
  initializeAppLifecycle,
  onFirstRunMaybe,
} from './lifecycle';
import MenuBuilder from './menu';
import { applyOzonePlatform } from './ozone';
import AppUpdater from './updater';

// Runs at module load, before anything reads `userData`: development builds
// must be isolated from installed ones before the Ozone platform and logger
// resolve their paths.
configureUserDataPath();

// Runs at module load: the Ozone platform is read during app startup, so this
// has to happen before `app.whenReady()` below.
applyOzonePlatform();

log.initialize();

if (!app.isPackaged) {
  log.transports.file.fileName = 'main.dev.log';
}

installMainDiagnostics();

const mb = menubar({
  icon: getIdleTrayIcon('auto'),
  index: Paths.indexHtml,
  browserWindow: WindowConfig,
  preloadWindow: true,
  showDockIcon: false, // Hide the app from the macOS dock
  hideOnClose: true, // Keep renderer state across WM close; Wayland-safe.
  escapeToHide: true, // Hide the window when Escape is pressed.
});

const menuBuilder = new MenuBuilder(mb);
const contextMenu = menuBuilder.buildMenu();

const appUpdater = new AppUpdater(mb, menuBuilder);

// Register before the renderer can load. The notification service relies on a
// one-shot readiness message from the renderer; registering the handlers inside
// `whenReady` (after `onFirstRunMaybe`) leaves a window where that message is
// sent before any listener exists, which leaves every later click and action
// queued forever.
registerNativeNotificationHandlers(mb);

app
  .whenReady()
  .then(async () => {
    await onFirstRunMaybe();

    initializeAppLifecycle(mb, contextMenu);

    // Configure window event handlers (Escape key, DevTools resize)
    configureWindowEvents(mb, menuBuilder);

    // Register IPC handlers for various channels
    registerTrayHandlers(mb);
    registerSystemHandlers(mb);
    registerStorageHandlers();
    registerGitHubCliHandlers();
    registerAppHandlers(mb);
    registerUpdaterHandlers(appUpdater);
  })
  .catch((err) => {
    logError('main', 'Failed to initialize application', toError(err));
  });
