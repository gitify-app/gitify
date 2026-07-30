import { app, powerMonitor, shell } from 'electron';
import type { Menubar } from 'electron-menubar';

import { EVENTS } from '../../shared/events';
import { logInfo } from '../../shared/logger';

import { handleMainEvent, onMainEvent, sendRendererEvent } from '../events';
import { applyKeepWindowOnBlur, applyWindowVibrancy } from '../lifecycle/window';
import { isDevMode } from '../utils';

/**
 * Register IPC handlers for OS-level system operations.
 *
 * @param mb - The menubar instance used for show/hide on keyboard shortcut activation.
 */
export function registerSystemHandlers(mb: Menubar): void {
  /**
   * Last accelerator the user successfully bound, so a failed change can
   * roll back to the previous working one rather than leave the user with
   * no shortcut at all.
   */
  let lastRegisteredAccelerator: string | null = null;

  /**
   * Register or unregister a global keyboard shortcut that toggles the menubar window visibility.
   *
   * `mb.setGlobalShortcut` handles unregister-then-register and the callback
   * (`mb.toggleWindow()`); we layer rollback on top because the library
   * does not retain a failed registration.
   */
  handleMainEvent(EVENTS.UPDATE_KEYBOARD_SHORTCUT, (_, { enabled, keyboardShortcut }) => {
    const previous = lastRegisteredAccelerator;

    if (!enabled) {
      mb.setGlobalShortcut(undefined);
      lastRegisteredAccelerator = null;
      return { success: true };
    }

    if (mb.setGlobalShortcut(keyboardShortcut)) {
      lastRegisteredAccelerator = keyboardShortcut;
      return { success: true };
    }

    if (previous) {
      mb.setGlobalShortcut(previous);
      lastRegisteredAccelerator = previous;
    }
    return { success: false };
  });

  /**
   * Handle system wake from sleep/hibernate
   */
  powerMonitor.on('resume', () => {
    sendRendererEvent(mb, EVENTS.SYSTEM_WAKE);
    logInfo('power-monitor', 'resume event triggered, will refetch data');
  });

  /**
   * Handle screen unlock (user returned to device)
   */
  powerMonitor.on('unlock-screen', () => {
    sendRendererEvent(mb, EVENTS.SYSTEM_WAKE);
    logInfo('power-monitor', 'unlock-screen event triggered, will refetch data');
  });

  /**
   * Open the given URL in the user's default browser, with an option to activate the app.
   */
  onMainEvent(EVENTS.OPEN_EXTERNAL, (_, { url, activate }) =>
    shell.openExternal(url, { activate }),
  );

  /**
   * Update the application's auto-launch setting based on the provided configuration.
   *
   * Skipped in development: the unsigned dev Electron binary cannot register as a
   * macOS login item, so calling this would only emit a Chromium error log.
   */
  onMainEvent(EVENTS.UPDATE_AUTO_LAUNCH, (_, settings) => {
    if (isDevMode()) {
      return;
    }
    app.setLoginItemSettings(settings);
  });

  /**
   * Toggle whether the window stays open when it loses focus.
   */
  onMainEvent(EVENTS.UPDATE_KEEP_WINDOW_ON_BLUR, (_, value: boolean) => {
    applyKeepWindowOnBlur(mb, value);
  });

  /**
   * Toggle the macOS window vibrancy material for the Glass design language.
   * Request/response so the renderer can await the material before clearing the
   * window's own background (avoids a black frame during the switch).
   */
  handleMainEvent(EVENTS.SET_WINDOW_VIBRANCY, (_, enabled: boolean) => {
    applyWindowVibrancy(mb, enabled);
    return undefined;
  });
}
