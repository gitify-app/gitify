import { app } from 'electron';
import type { Menubar } from 'electron-menubar';

import { APPLICATION } from '../../shared/constants';
import { EVENTS } from '../../shared/events';
import { logInfo, logWarn } from '../../shared/logger';

import { sendRendererEvent } from '../events';

/** Delay before re-asserting the hidden dock after startup (see #3069). */
const DOCK_REHIDE_DELAY_MS = 2_000;

/**
 * Set up core application lifecycle events including tray ready setup,
 * protocol URL handling, and single-instance enforcement.
 *
 * The tray's context-menu wiring (Linux `setContextMenu` vs macOS/Windows
 * right-click popup) and the macOS `setIgnoreDoubleClickEvents` default
 * are owned by `electron-menubar` — pass `contextMenu` here and the library
 * picks the right binding per platform.
 *
 * @param mb - The menubar instance to attach lifecycle events to.
 * @param contextMenu - The tray context menu to attach via `mb.setContextMenu`.
 * @param protocol - The custom protocol string (e.g. 'gitify' or 'gitify-dev').
 */
export function initializeAppLifecycle(
  mb: Menubar,
  contextMenu: Electron.Menu,
  protocol: string,
): void {
  mb.on('ready', () => {
    mb.app.setAppUserModelId(APPLICATION.ID);
    mb.tray.setToolTip(APPLICATION.NAME);
    mb.setContextMenu(contextMenu);

    // macOS can silently drop `app.dock.hide()` when it races an app
    // activation transition, and `electron-menubar` calls it very early in
    // startup. If that hide was swallowed, the dock icon sticks around for
    // the whole session (#3069). Re-check once startup has settled; guarded
    // on visibility because `dock.hide()` also deactivates the app.
    setTimeout(() => {
      if (app.dock?.isVisible()) {
        app.dock.hide();
      }
    }, DOCK_REHIDE_DELAY_MS);
  });

  preventSecondInstance(mb, protocol);
}

/**
 * Handle a gitify:// protocol URL by forwarding it to the renderer process
 * as an AUTH_CALLBACK event.
 *
 * @param mb - The menubar instance to forward the event through.
 * @param url - The protocol URL to handle.
 * @param protocol - The custom protocol string to match.
 */
export function handleProtocolURL(mb: Menubar, url: string, protocol: string): void {
  if (url.startsWith(`${protocol}://`)) {
    logInfo('main:handleUrl', `forwarding URL ${url} to renderer process`);
    sendRendererEvent(mb, EVENTS.AUTH_CALLBACK, url);
  }
}

/**
 * Enforce a single application instance. If a second instance is launched,
 * any protocol URL in the command line is forwarded to the existing instance.
 *
 * @param mb - The menubar instance to show when a second instance is detected.
 * @param protocol - The custom protocol string to extract from command line args.
 */
function preventSecondInstance(mb: Menubar, protocol: string): void {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    logWarn('main:gotTheLock', 'Second instance detected, quitting');
    app.quit();
    return;
  }

  app.on('second-instance', (_event, commandLine) => {
    logInfo('main:second-instance', 'Second instance was launched. Extracting command to forward');

    const url = commandLine.find((arg) => arg.startsWith(`${protocol}://`));

    if (url) {
      handleProtocolURL(mb, url, protocol);
    }
  });
}
