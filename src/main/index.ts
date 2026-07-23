import { app } from 'electron';
import log from 'electron-log';
import { menubar } from 'electron-menubar';

import { logError, logInfo } from '../shared/logger';

import { Paths, WindowConfig } from './config';
import {
  registerAppHandlers,
  registerStorageHandlers,
  registerSystemHandlers,
  registerTrayHandlers,
} from './handlers';
import { TrayIcons } from './icons';
import {
  configureWindowEvents,
  handleProtocolURL,
  initializeAppLifecycle,
  onFirstRunMaybe,
} from './lifecycle';
import MenuBuilder from './menu';
import AppUpdater from './updater';
import { isDevMode } from './utils';

log.initialize();

if (!app.isPackaged) {
  log.transports.file.fileName = 'main.dev.log';
}

const mb = menubar({
  icon: TrayIcons.idle,
  index: Paths.indexHtml,
  browserWindow: WindowConfig,
  preloadWindow: true,
  showDockIcon: false, // Hide the app from the macOS dock
  hideOnClose: true, // Keep renderer state across WM close; Wayland-safe.
  escapeToHide: true, // Hide the window when Escape is pressed.
});

// Diagnostic instrumentation for #3064 (investigation branch only).
// Logs raw tray events, menubar lifecycle, and a heartbeat to main.log so we
// can tell whether the main process stalls or tray events stop being
// delivered on affected Windows machines.
{
  process.on('uncaughtException', (err: Error) => {
    logError('diag:uncaughtException', 'Uncaught exception in main process', err);
  });
  process.on('unhandledRejection', (reason: unknown) => {
    logError(
      'diag:unhandledRejection',
      'Unhandled rejection in main process',
      reason instanceof Error ? reason : new Error(String(reason)),
    );
  });
  setInterval(() => {
    logInfo('diag:heartbeat', 'main process event loop alive');
  }, 30_000);
  for (const ev of [
    'ready',
    'create-window',
    'after-create-window',
    'show',
    'after-show',
    'hide',
    'after-hide',
    'focus-lost',
  ] as const) {
    mb.on(ev, () => logInfo('diag:menubar', `event '${ev}'`));
  }
  mb.on('ready', () => {
    logInfo(
      'diag:tray',
      `listeners bound: click=${mb.tray.listenerCount('click')} right-click=${mb.tray.listenerCount('right-click')}`,
    );
    mb.tray.on('click', (_event, bounds) => {
      logInfo('diag:tray', `raw 'click' bounds=${JSON.stringify(bounds)}`);
    });
    mb.tray.on('right-click', (_event, bounds) => {
      logInfo('diag:tray', `raw 'right-click' bounds=${JSON.stringify(bounds)}`);
    });
    mb.tray.on('double-click', (_event, bounds) => {
      logInfo('diag:tray', `raw 'double-click' bounds=${JSON.stringify(bounds)}`);
    });
    mb.on('after-show', () => {
      if (mb.window) {
        logInfo(
          'diag:window',
          `after-show visible=${mb.window.isVisible()} bounds=${JSON.stringify(mb.window.getBounds())}`,
        );
      }
    });
  });
}

if (process.env.GITIFY_DIAG) {
  const diagEvents: Array<[string, number]> = [];
  // biome-ignore lint/suspicious/noExplicitAny: diagnostic hook
  (globalThis as any).__mb = mb;
  // biome-ignore lint/suspicious/noExplicitAny: diagnostic hook
  (globalThis as any).__gitifyDiagEvents = diagEvents;
  for (const ev of [
    'ready',
    'create-window',
    'before-load',
    'after-create-window',
    'show',
    'after-show',
    'hide',
    'after-hide',
    'focus-lost',
    'after-close',
  ]) {
    mb.on(ev, () => diagEvents.push([ev, Date.now()]));
  }
}

const menuBuilder = new MenuBuilder(mb);
const contextMenu = menuBuilder.buildMenu();

// Register your app as the handler for a custom protocol
const protocol = isDevMode() ? 'gitify-dev' : 'gitify';
app.setAsDefaultProtocolClient(protocol);

const appUpdater = new AppUpdater(mb, menuBuilder);

app.whenReady().then(async () => {
  await onFirstRunMaybe();

  appUpdater.start();

  initializeAppLifecycle(mb, contextMenu, protocol);

  // Configure window event handlers (Escape key, DevTools resize)
  configureWindowEvents(mb, menuBuilder);

  // Register IPC handlers for various channels
  registerTrayHandlers(mb);
  registerSystemHandlers(mb);
  registerStorageHandlers();
  registerAppHandlers(mb);
});

// Handle gitify:// custom protocol URL events for OAuth 2.0 callback
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleProtocolURL(mb, url, protocol);
});
