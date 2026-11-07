import { app } from 'electron';
import log from 'electron-log';
import { menubar } from 'electron-menubar';

import { logError, toError } from '../shared/logger';

import { Paths, WindowConfig } from './config';
import {
  registerAppHandlers,
  registerGitHubCliHandlers,
  registerLanguageHandlers,
  registerNativeNotificationHandlers,
  registerStorageHandlers,
  registerSystemHandlers,
  registerTrayHandlers,
  registerUpdaterHandlers,
} from './handlers';
import { getIdleTrayIcon } from './icons';
import { initializeMainLanguage } from './language';
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

// Capture relaunches before ready; attach the window after language initialization.
const attachAppLifecycle = initializeAppLifecycle();

if (attachAppLifecycle) {
  const languageReady = app.whenReady().then(() => initializeMainLanguage());
  registerLanguageHandlers(languageReady);

  languageReady
    .then(async () => {
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
      const appUpdater = new AppUpdater(mb, menuBuilder);

      // Register before the renderer's initial ready message and before awaiting the first-run prompt.
      // NativeNotificationService.show also establishes readiness as a fallback.
      registerNativeNotificationHandlers(mb);

      attachAppLifecycle(mb, () => menuBuilder.buildMenu());
      // The window exists at before-load; attach DevTools and visibility hooks before rendering.
      mb.once('before-load', () => configureWindowEvents(mb, menuBuilder));

      // Application IPC handlers
      registerTrayHandlers(mb);
      registerSystemHandlers(mb);
      registerStorageHandlers();
      registerGitHubCliHandlers();
      registerAppHandlers(mb);
      registerUpdaterHandlers(appUpdater);
      await onFirstRunMaybe();
    })
    .catch((err) => {
      logError('main', 'Failed to initialize application', toError(err));
    });
}
