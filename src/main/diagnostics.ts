import log from 'electron-log';

import { sanitizeErrorForLog } from '../shared/logger';

let installed = false;

/**
 * Install the main-process uncaught-error handler once.
 *
 * Uncaught exceptions and unhandled rejections are written to the application
 * log without a modal dialog. Native listeners pass the original rejection
 * value to the sanitizer before electron-log can stringify structured reasons.
 */
export function installMainDiagnostics(): void {
  if (installed) {
    return;
  }

  installed = true;

  const reportError = (error: unknown) => {
    log.error('[uncaught]', sanitizeErrorForLog(error));
  };

  // Also protect errors forwarded by electron-log's renderer IPC transport.
  log.errorHandler.setOptions({
    showDialog: false,
    onError: ({ error }) => {
      reportError(error);
      // Suppress electron-log's default logging of the original error.
      return false;
    },
  });

  process.on('uncaughtException', reportError);
  process.on('unhandledRejection', reportError);
}
