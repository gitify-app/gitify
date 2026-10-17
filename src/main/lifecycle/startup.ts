import { app } from 'electron';
import type { Menubar } from 'electron-menubar';

import { APPLICATION } from '../../shared/constants';
import { logWarn } from '../../shared/logger';

/**
 * Set up core application lifecycle events: tray ready setup and
 * single-instance enforcement.
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
  mb.on('ready', () => {
    mb.app.setAppUserModelId(APPLICATION.ID);
    mb.tray.setToolTip(APPLICATION.NAME);
    mb.setContextMenu(contextMenu);
  });

  preventSecondInstance();
}

/**
 * Enforce a single application instance. A second launch quits immediately so
 * the already-running tray instance remains the only one.
 */
function preventSecondInstance(): void {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    logWarn('main:gotTheLock', 'Second instance detected, quitting');
    app.quit();
  }
}
