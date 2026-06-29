import { app, shell } from 'electron';
import type { Menubar } from 'electron-menubar';

import { EVENTS } from '../../shared/events';

import { handleMainEvent, onMainEvent } from '../events';
import { applyKeepWindowOnBlur } from '../lifecycle/window';

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
   * Open the given URL in the user's default browser, with an option to activate the app.
   */
  onMainEvent(EVENTS.OPEN_EXTERNAL, (_, { url, activate }) =>
    shell.openExternal(url, { activate }),
  );

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
   * Update the application's auto-launch setting based on the provided configuration.
   */
  onMainEvent(EVENTS.UPDATE_AUTO_LAUNCH, (_, settings) => {
    app.setLoginItemSettings(settings);
  });

  /**
   * Toggle whether the window stays open when it loses focus.
   */
  onMainEvent(EVENTS.UPDATE_KEEP_WINDOW_ON_BLUR, (_, value: boolean) => {
    applyKeepWindowOnBlur(mb, value);
  });
}
