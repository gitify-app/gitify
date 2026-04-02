import { dialog } from 'electron';
import type { Menubar } from 'menubar';

import { APPLICATION } from '../../shared/constants';
import { EVENTS } from '../../shared/events';

import { sendRendererEvent } from '../events';

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
    title: `Reset ${APPLICATION.NAME}`,
    message: `Are you sure you want to reset ${APPLICATION.NAME}? You will be logged out of all accounts`,
    buttons: ['Cancel', 'Reset'],
    defaultId: cancelButtonId,
    cancelId: cancelButtonId,
  });

  if (response === resetButtonId) {
    sendRendererEvent(mb, EVENTS.RESET_APP);
    mb.app.quit();
  }
}
