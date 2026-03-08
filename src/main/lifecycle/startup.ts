import { app } from 'electron';
import type { Menubar } from 'menubar';

import { APPLICATION } from '../../shared/constants';
import { EVENTS } from '../../shared/events';
import { logInfo, logWarn } from '../../shared/logger';

import { sendRendererEvent } from '../events';

/**
 * Set up core application lifecycle events including tray ready setup,
 * protocol URL handling, and single-instance enforcement.
 *
 * @param mb - The menubar instance to attach lifecycle events to.
 * @param contextMenu - The tray context menu to pop up on right-click.
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

    mb.tray.setIgnoreDoubleClickEvents(true);

    mb.tray.on('right-click', (_event, bounds) => {
      mb.tray.popUpContextMenu(contextMenu, { x: bounds.x, y: bounds.y });
    });
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
export function handleProtocolURL(
  mb: Menubar,
  url: string,
  protocol: string,
): void {
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
    logInfo(
      'main:second-instance',
      'Second instance was launched. Extracting command to forward',
    );

    const url = commandLine.find((arg) => arg.startsWith(`${protocol}://`));

    if (url) {
      handleProtocolURL(mb, url, protocol);
    }
  });
}
