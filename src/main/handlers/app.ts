import { app } from 'electron';
import type { Menubar } from 'electron-menubar';

import { EVENTS } from '../../shared/events';

import { Paths } from '../config';
import { handleMainEvent, onMainEvent } from '../events';
import { getLanguageState, setNativeLanguage } from '../language';

/**
 * Register IPC handlers for general application queries and window/app control.
 *
 * @param mb - The menubar instance used for window visibility and app quit control.
 */
export function registerAppHandlers(mb: Menubar): void {
  handleMainEvent(EVENTS.VERSION, () => app.getVersion());

  onMainEvent(EVENTS.WINDOW_SHOW, () => mb.showWindow());

  onMainEvent(EVENTS.WINDOW_HIDE, () => mb.hideWindow());

  onMainEvent(EVENTS.QUIT, () => mb.app.quit());

  // Path handlers for renderer queries about resource locations
  handleMainEvent(EVENTS.NOTIFICATION_SOUND_PATH, () => {
    return Paths.notificationSound;
  });

  handleMainEvent(EVENTS.TWEMOJI_DIRECTORY, () => {
    return Paths.twemojiFolder;
  });
}

export function registerLanguageHandlers(ready: Promise<void>): void {
  handleMainEvent(EVENTS.LANGUAGE_GET, async () => {
    await ready;
    return getLanguageState();
  });
  handleMainEvent(EVENTS.LANGUAGE_SET, async (_event, language) => {
    await ready;
    return setNativeLanguage(language);
  });
}
