import log from 'electron-log/renderer';

import { sanitizeErrorForLog } from '../shared/logger';

let installed = false;

/**
 * Install the renderer-process uncaught-error handler once.
 *
 * The renderer transport forwards to the main process log. Errors are
 * projected through `sanitizeErrorForLog` before forwarding so request
 * objects, headers, and tokens are never serialized. No modal dialog is shown.
 */
export function installRendererDiagnostics(): void {
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
