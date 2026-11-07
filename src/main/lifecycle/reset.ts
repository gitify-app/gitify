import { dialog } from 'electron';
import type { Menubar } from 'electron-menubar';

import { APPLICATION } from '../../shared/constants';
import { EVENTS } from '../../shared/events';
import { logError, toError } from '../../shared/logger';

import { sendRendererEvent } from '../events';
import { i18n, resetLanguagePreference } from '../language';

/**
 * Confirm, clear the main-process preference, then reset the renderer and quit.
 * If clearing the preference fails, leave the application running and its state intact.
 *
 * @param mb - The menubar instance used for the dialog parent window and quit.
 */
export function resetApp(mb: Menubar): void {
  if (!mb.window) {
    return;
  }

  const cancelButtonId = 0;
  const resetButtonId = 1;

  const response = dialog.showMessageBoxSync(mb.window, {
    type: 'warning',
    title: i18n.t('native:menu.reset', 'Reset {{appName}}', { appName: APPLICATION.NAME }),
    message: i18n.t(
      'native:native.reset_message',
      'Are you sure you want to reset {{appName}}? You will be logged out of all accounts',
      { appName: APPLICATION.NAME },
    ),
    buttons: [
      i18n.t('native:common.cancel', 'Cancel'),
      i18n.t('native:settings.reset.confirm', 'Reset'),
    ],
    defaultId: cancelButtonId,
    cancelId: cancelButtonId,
  });

  if (response === resetButtonId) {
    try {
      resetLanguagePreference();
    } catch (error) {
      logError('reset', 'Unable to clear language preference', toError(error));
      return;
    }
    sendRendererEvent(mb, EVENTS.RESET_APP);
    mb.app.quit();
  }
}
