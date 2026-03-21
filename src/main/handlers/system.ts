import { app, globalShortcut, shell } from 'electron';
import type { Menubar } from 'menubar';

import {
  EVENTS,
  type EventData,
  type IAutoLaunch,
  type IKeyboardShortcut,
  type IKeyboardShortcutResult,
  type IOpenExternal,
} from '../../shared/events';

import { handleMainEvent, onMainEvent } from '../events';

/**
 * Register IPC handlers for OS-level system operations.
 *
 * @param mb - The menubar instance used for show/hide on keyboard shortcut activation.
 */
export function registerSystemHandlers(mb: Menubar): void {
  /**
   * Currently registered accelerator for the global shortcut, or `null` when none.
   */
  let lastRegisteredAccelerator: string | null = null;

  const toggleWindow = () => {
    if (mb.window.isVisible()) {
      mb.hideWindow();
    } else {
      mb.showWindow();
    }
  };

  /**
   * Open the given URL in the user's default browser, with an option to activate the app.
   */
  onMainEvent(EVENTS.OPEN_EXTERNAL, (_, { url, activate }: IOpenExternal) =>
    shell.openExternal(url, { activate }),
  );

  /**
   * Register or unregister a global keyboard shortcut that toggles the menubar window visibility.
   */
  handleMainEvent(
    EVENTS.UPDATE_KEYBOARD_SHORTCUT,
    (_, data: EventData): IKeyboardShortcutResult => {
      const { enabled, keyboardShortcut } = data as IKeyboardShortcut;
      const previous = lastRegisteredAccelerator;

      if (lastRegisteredAccelerator) {
        globalShortcut.unregister(lastRegisteredAccelerator);
        lastRegisteredAccelerator = null;
      }

      if (!enabled) {
        return { success: true };
      }

      const ok = globalShortcut.register(keyboardShortcut, toggleWindow);
      if (ok) {
        lastRegisteredAccelerator = keyboardShortcut;
        return { success: true };
      }

      if (previous) {
        globalShortcut.register(previous, toggleWindow);
        lastRegisteredAccelerator = previous;
      }
      return { success: false };
    },
  );

  /**
   * Update the application's auto-launch setting based on the provided configuration.
   */
  onMainEvent(EVENTS.UPDATE_AUTO_LAUNCH, (_, settings: IAutoLaunch) => {
    app.setLoginItemSettings(settings);
  });
}
