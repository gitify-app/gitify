import log from 'electron-log';

import { sanitizeErrorForLog } from '../shared/logger';

let installed = false;

/**
 * Install the main-process uncaught-error handler once.
 *
 * Uncaught exceptions and unhandled rejections are written to the application
 * log through `electron-log`'s error handler, without a modal dialog. Errors
 * are projected through `sanitizeErrorForLog` so request objects, headers, and
 * tokens are never serialized.
 */
export function installMainDiagnostics(): void {
  if (installed) {
    return;
  }

  installed = true;

  log.errorHandler.startCatching({
    showDialog: false,
    onError: ({ error }) => {
      log.error('[uncaught]', sanitizeErrorForLog(error));
    },
  });
}
