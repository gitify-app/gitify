import { app } from 'electron';
import type { Menubar } from 'electron-menubar';

import { isMacOS } from '../../shared/platform';

import { WindowConfig } from '../config';
import type MenuBuilder from '../menu';

let isQuitting = false;
let windowVibrancyEnabled = false;

/**
 * Reset module-level lifecycle flags. Module-level state is unavoidable
 * because `app.on(...)` listeners are registered once at startup; this
 * helper lets tests start each case from a clean slate.
 *
 * @internal
 */
export function __resetWindowLifecycleForTests(): void {
  isQuitting = false;
  windowVibrancyEnabled = false;
}

/**
 * Enable or disable the macOS window vibrancy material (the Glass design
 * language). No-op off macOS. The desired state is remembered so it can be
 * re-applied if `electron-menubar` rebuilds the window (see `configureWindowEvents`).
 */
export function applyWindowVibrancy(mb: Menubar, enabled: boolean): void {
  windowVibrancyEnabled = enabled;
  if (!isMacOS() || !mb.window || mb.window.isDestroyed()) {
    return;
  }
  mb.window.setVibrancy(enabled ? 'popover' : null);
  // Clear the window's own background so the vibrancy material can sample the
  // desktop; a prior Classic disable leaves it opaque, which would otherwise
  // block Glass on a runtime Classic → Glass switch. `#00000000` works without a
  // `transparent` window because the vibrancy view provides the translucency.
  // Restore an opaque backdrop for Classic once the material is removed.
  mb.window.setBackgroundColor(enabled ? '#00000000' : '#ffffff');
}

export function applyKeepWindowOnBlur(mb: Menubar, value: boolean): void {
  mb.setOption('hideOnBlur', !value);
}

/**
 * Attach window-level event listeners for DevTools and visibility sync.
 *
 * Window close-as-hide, the Wayland half-closed-surface defer, and the
 * Escape-to-hide handler are all provided by `electron-menubar` via
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
    // Re-apply vibrancy in case the window was rebuilt since it was last set.
    applyWindowVibrancy(mb, windowVibrancyEnabled);
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
  });

  /**
   * When DevTools is closed, restore the window to its original size and position it centered on the tray icon.
   *
   * Menubar restores focus behavior; Gitify restores its preferred layout.
   */
  mb.window.webContents.on('devtools-closed', () => {
    if (!mb.window) {
      return;
    }

    mb.window.setSize(WindowConfig.width!, WindowConfig.height!);
    mb.recenterOnTray();
    mb.window.resizable = false;
  });
}
