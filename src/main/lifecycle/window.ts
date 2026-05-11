import { app } from 'electron';
import type { Menubar } from '@gitify/menubar';

import { isMacOS } from '../../shared/platform';

import { WindowConfig } from '../config';
import type MenuBuilder from '../menu';

let isQuitting = false;
let keepWindowOnBlur = false;

/**
 * Reset module-level lifecycle flags. Module-level state is unavoidable
 * because `app.on(...)` listeners are registered once at startup; this
 * helper lets tests start each case from a clean slate.
 *
 * @internal
 */
export function __resetWindowLifecycleForTests(): void {
  isQuitting = false;
  keepWindowOnBlur = false;
}

/**
 * Apply the user's "keep window open when it loses focus" preference.
 *
 * Implemented by toggling the window's `alwaysOnTop` flag, which the
 * `menubar` library checks to short-circuit its blur-driven hide. The
 * value is also remembered so the `devtools-closed` handler can restore
 * it after DevTools temporarily forces it on.
 */
export function applyKeepWindowOnBlur(mb: Menubar, value: boolean): void {
  keepWindowOnBlur = value;
  if (mb.window && !mb.window.isDestroyed()) {
    mb.window.setAlwaysOnTop(value);
  }
}

/**
 * Attach window-level event listeners for DevTools and visibility sync.
 *
 * Window close-as-hide, the Wayland half-closed-surface defer, and the
 * Escape-to-hide handler are all provided by `@gitify/menubar` via
 * `hideOnClose` and `escapeToHide` options (configured in `main/index.ts`).
 *
 * @param mb - The menubar instance whose window events are configured.
 * @param menuBuilder - The menu builder used to keep the Show / Hide tray
 *   menu items in sync with window visibility.
 */
export function configureWindowEvents(mb: Menubar, menuBuilder: MenuBuilder): void {
  const win = mb.window;
  if (!win) {
    return;
  }

  win.on('show', () => {
    menuBuilder.setWindowVisibility(true);
  });

  win.on('hide', () => {
    menuBuilder.setWindowVisibility(false);
  });

  app.on('before-quit', () => {
    isQuitting = true;
  });

  /**
   * Safety net: if the WM tears down the window despite our `hideOnClose`
   * preventDefault (a known Wayland edge case), suppress the default
   * Electron quit so the tray icon stays put and `menubar` can recreate
   * the window on the next tray click.
   */
  app.on('window-all-closed', () => {
    if (!isQuitting) {
      return;
    }
    if (!isMacOS()) {
      app.quit();
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
   *
   * `devtools-opened` forces `alwaysOnTop` true for usability while
   * debugging; restore it to the user's preference here so DevTools
   * doesn't leave the flag stuck on.
   */
  mb.window.webContents.on('devtools-closed', () => {
    if (!mb.window) {
      return;
    }

    mb.window.setSize(WindowConfig.width!, WindowConfig.height!);
    mb.recenterOnTray();
    mb.window.resizable = false;
    mb.window.setAlwaysOnTop(keepWindowOnBlur);
  });
}
