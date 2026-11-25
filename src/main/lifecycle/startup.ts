import { app } from 'electron';
import type { Menubar } from 'electron-menubar';

import { APPLICATION } from '../../shared/constants';
import { logError, logWarn, toError } from '../../shared/logger';

/**
 * Set up core application lifecycle events: tray ready setup and
 * single-instance enforcement, showing the existing window on a second launch.
 * Register before Electron becomes ready so early launches can wait for the
 * menubar's preloaded window.
 *
 * The tray's context-menu wiring (Linux `setContextMenu` vs macOS/Windows
 * right-click popup) and the macOS `setIgnoreDoubleClickEvents` default
 * are owned by `electron-menubar` — pass `contextMenu` here and the library
 * picks the right binding per platform.
 *
 * @param mb - The menubar instance to attach lifecycle events to.
 * @param contextMenu - The tray context menu to attach via `mb.setContextMenu`.
 */
export function initializeAppLifecycle(mb: Menubar, contextMenu: Electron.Menu): void {
  if (!app.requestSingleInstanceLock()) {
    logWarn('main:gotTheLock', 'Second instance detected, quitting');
    app.quit();
    return;
  }

  let isMenubarReady = false;
  let showRequested = false;

  const showWindow = () => {
    void mb.showWindow().catch((error) => {
      logError('main:second-instance', 'Failed to show the existing window', toError(error));
    });
  };

  mb.on('ready', () => {
    mb.app.setAppUserModelId(APPLICATION.ID);
    mb.tray.setToolTip(APPLICATION.NAME);
    mb.setContextMenu(contextMenu);
    isMenubarReady = true;

    if (showRequested) {
      showRequested = false;
      showWindow();
    }
  });

  app.on('second-instance', () => {
    if (isMenubarReady) {
      showWindow();
    } else {
      // Coalesce launches while the initial window is still loading.
      showRequested = true;
    }
  });
}
