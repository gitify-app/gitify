import { app, type BrowserWindow } from 'electron';
import type { Menubar } from 'menubar';

import { logWarn, toError } from '../../shared/logger';

import { WindowConfig } from '../config';

let keepRunningInTray = false;
let isQuitting = false;

/**
 * Update the "keep running in tray" preference. When `true`, an OS / window
 * manager close request hides the window instead of quitting the app.
 *
 * @param value - `true` to hide on window close, `false` to quit.
 */
export function setKeepRunningInTray(value: boolean): void {
  keepRunningInTray = value;
}

/**
 * Reset module-level lifecycle flags. Module-level state is unavoidable
 * because `app.on(...)` listeners are registered once at startup; this
 * helper lets tests start each case from a clean slate.
 *
 * @internal
 */
export function __resetWindowLifecycleForTests(): void {
  keepRunningInTray = false;
  isQuitting = false;
}

/**
 * Restore menubar's `_browserWindow` field after we hide the window so
 * the next tray click reuses the same window instance. Wrapped in a
 * try/catch so a future menubar refactor that renames the field
 * degrades gracefully (next show creates a fresh window, losing renderer
 * state but not crashing).
 */
function restoreMenubarWindowReference(mb: Menubar, win: BrowserWindow): void {
  if (mb.window) {
    return;
  }
  try {
    (mb as unknown as { _browserWindow: BrowserWindow })._browserWindow = win;
  } catch (error) {
    logWarn(
      'main:window',
      `failed to restore menubar window reference: ${toError(error).message}`,
    );
  }
}

/**
 * Attach window-level event listeners for keyboard input and DevTools.
 *
 * @param mb - The menubar instance whose window events are configured.
 */
export function configureWindowEvents(mb: Menubar): void {
  const win = mb.window;
  if (!win) {
    return;
  }

  /**
   * Track explicit quit requests so the close handlers can distinguish
   * between an app quit and a WM-initiated window close.
   */
  app.on('before-quit', () => {
    isQuitting = true;
  });

  /**
   * Intercept window close so a WM close request hides the window
   * instead of destroying it. Hiding (rather than destroying + recreating)
   * preserves the renderer state — keyboard listeners, notification
   * cache, scroll position, etc.
   *
   * Implementation notes:
   *
   *   1. `menubar` registers its own `close` listener (`windowClear`)
   *      that nulls `mb.window` regardless of `preventDefault`. Listeners
   *      run in registration order, so by the time our handler executes,
   *      `mb.window` is already `undefined`. We capture the
   *      `BrowserWindow` reference at config time (above) and use that
   *      captured reference inside the handler, then restore menubar's
   *      internal field so the next tray click reuses this same window.
   *
   *   2. On Wayland, calling `hide()` synchronously after `preventDefault`
   *      on a frameless surface can leave it in a half-closed state where
   *      the window stays mapped but loses keyboard input routing.
   *      Deferring with `setImmediate` lets the close cancellation unwind
   *      first.
   */
  win.on('close', (event) => {
    if (!keepRunningInTray || isQuitting) {
      return;
    }

    event.preventDefault();

    setImmediate(() => {
      if (win.isDestroyed()) {
        return;
      }

      win.hide();
      restoreMenubarWindowReference(mb, win);
    });
  });

  /**
   * Safety net: if the WM tears down the window despite `preventDefault`
   * (a known Wayland edge case), suppress the default Electron quit so
   * the tray icon stays put and `menubar` can recreate the window on
   * the next tray click.
   */
  app.on('window-all-closed', () => {
    if (keepRunningInTray && !isQuitting) {
      return;
    }
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

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
   */
  mb.window.webContents.on('devtools-closed', () => {
    if (!mb.window) {
      return;
    }

    const trayBounds = mb.tray.getBounds();
    mb.window.setSize(WindowConfig.width!, WindowConfig.height!);
    mb.positioner.move('trayCenter', trayBounds);
    mb.window.resizable = false;
  });
}
