import log from 'electron-log/renderer';

// Suppress the browser's default output without inspecting the error payload.
window.addEventListener('error', (event) => {
  event.preventDefault();
  log.error('[diagnostics]', { process: 'renderer', event: 'uncaught-error' });
});

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  log.error('[diagnostics]', { process: 'renderer', event: 'unhandled-rejection' });
});

// App and i18n modules must not evaluate until diagnostics are listening.
void import('./index').catch(() => {
  log.error('[diagnostics]', {
    process: 'renderer',
    event: 'startup-failed',
    phase: 'load-renderer',
  });
});
