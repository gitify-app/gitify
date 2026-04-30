import type { Menubar } from 'menubar';

import { WindowConfig } from '../config';

/**
 * Attach window-level event listeners for keyboard input and DevTools.
 *
 * @param mb - The menubar instance whose window events are configured.
 */
export function configureWindowEvents(mb: Menubar): void {
  if (!mb.window) {
    return;
  }

  /**
   * Listen for 'before-input-event' to detect Escape key presses and hide the window.
   */
  mb.window.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      mb.hideWindow();
      event.preventDefault();
    }
  });

  /**
   * When DevTools is opened, resize and center the window for better visibility and allow resizing.
   */
  mb.window.webContents.on('devtools-opened', () => {
    if (!mb.window) {
      return;
    }

    mb.window.setSize(800, 600);
    mb.window.center();
    mb.window.resizable = true;
    mb.window.setAlwaysOnTop(true);
  });

  /**
   * When DevTools is closed, restore the window to its original size and position it centered on the tray icon.
   * Keep the window resizable to allow users to adjust the size at any time.
   */
  mb.window.webContents.on('devtools-closed', () => {
    if (!mb.window) {
      return;
    }

    const trayBounds = mb.tray.getBounds();
    mb.window.setSize(WindowConfig.width!, WindowConfig.height!);
    mb.positioner.move('trayCenter', trayBounds);
  });
}
