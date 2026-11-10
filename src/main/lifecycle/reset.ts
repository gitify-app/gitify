import { dialog } from 'electron';
import type { Menubar } from 'electron-menubar';

import { APPLICATION } from '../../shared/constants';
import { EVENTS } from '../../shared/events';

import { sendRendererEvent } from '../events';
import { i18n } from '../language';

/**
 * Show a confirmation dialog and, if confirmed, broadcast a reset event to the
 * renderer then quit the application.
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
    sendRendererEvent(mb, EVENTS.RESET_APP);
    mb.app.quit();
  }
}
