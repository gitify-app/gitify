import { app } from 'electron';
import type { Menubar } from 'electron-menubar';

import { APPLICATION } from '../../shared/constants';
import { logError, logWarn, toError } from '../../shared/logger';

/**
 * Enforce a single instance and capture relaunches before Electron becomes ready.
 * The returned callback attaches tray setup after language initialization creates
 * the menubar; early launches wait for its preloaded window.
 *
 * The tray's context-menu wiring (Linux `setContextMenu` vs macOS/Windows
 * right-click popup) and the macOS `setIgnoreDoubleClickEvents` default
 * are owned by `electron-menubar`. The `getContextMenu` callback builds the menu
 * at tray readiness so its labels use the current language; the library picks
 * the right binding per platform.
 *
 * @returns The menubar setup callback, or undefined when this process must quit.
 */
export function initializeAppLifecycle():
  | ((mb: Menubar, getContextMenu: () => Electron.Menu) => void)
  | undefined {
  if (!app.requestSingleInstanceLock()) {
    logWarn('main:gotTheLock', 'Second instance detected, quitting');
    app.quit();
    return;
  }

  let showWindow: (() => void) | undefined;
  let showRequested = false;

  app.on('second-instance', () => {
    if (showWindow) {
      showWindow();
    } else {
      // Coalesce launches while language and the initial window are still loading.
      showRequested = true;
    }
  });

  return (mb, getContextMenu) => {
    mb.on('ready', () => {
      mb.app.setAppUserModelId(APPLICATION.ID);
      mb.tray.setToolTip(APPLICATION.NAME);
      mb.setContextMenu(getContextMenu());
      showWindow = () => {
        void mb.showWindow().catch((error) => {
          logError('main:second-instance', 'Failed to show the existing window', toError(error));
        });
      };

      if (showRequested) {
        showRequested = false;
        showWindow();
      }
    });
  };
}
