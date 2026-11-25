import { app } from 'electron';
import log from 'electron-log';

/** Record uncaught failures without reading or logging the original error. */
export function installMainDiagnostics(): void {
  // The preload can forward logger failures. Bypass electron-log's default
  // handler so it never normalizes or logs the forwarded payload.
  log.errorHandler.handle = () => {
    log.error('[diagnostics]', { process: 'renderer', event: 'logger-error-forwarded' });
  };

  process.on('uncaughtException', () => {
    try {
      log.error('[diagnostics]', { process: 'main', event: 'uncaught-exception' });
    } catch {
      // Do not surface a second exception if logging itself fails.
    } finally {
      app.exit(1);
    }
  });

  process.on('unhandledRejection', () => {
    log.error('[diagnostics]', { process: 'main', event: 'unhandled-rejection' });
  });
}
