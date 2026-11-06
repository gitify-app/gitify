import log from 'electron-log/renderer';

import { sanitizeErrorForLog } from '../shared/logger';

let installed = false;

/**
 * Install the renderer-process uncaught-error handler once.
 *
 * Native events are projected through `sanitizeErrorForLog` before forwarding
 * to the main log. This avoids electron-log stringifying structured rejection
 * reasons before their credential-bearing properties can be dropped.
 */
export function installRendererDiagnostics(): void {
  if (installed) {
    return;
  }

  installed = true;

  const reportError = (error: unknown) => {
    log.error('[uncaught]', sanitizeErrorForLog(error));
  };

  log.errorHandler.setOptions({
    showDialog: false,
    onError: ({ error }) => {
      reportError(error);
      // Suppress the default console/IPC path carrying the original error.
      return false;
    },
  });

  window.addEventListener('error', (event) => {
    event.preventDefault();
    reportError(event.error ?? { message: event.message });
  });
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    reportError(event.reason);
  });
}
