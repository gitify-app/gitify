import { app } from 'electron';
import log from 'electron-log';
import { menubar } from 'menubar';

import { EVENTS } from '../shared/events';

import { Paths, WindowConfig } from './config';
import { onMainEvent } from './events';
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
  // Keep Dock icon in development to make the app easy to find/debug.
  showDockIcon: false,
});

const menuBuilder = new MenuBuilder(mb);
const contextMenu = menuBuilder.buildMenu();

// Register your app as the handler for a custom protocol
const protocol = isDevMode() ? 'gitify-dev' : 'gitify';
app.setAsDefaultProtocolClient(protocol);

const appUpdater = new AppUpdater(mb, menuBuilder);

// Keep update-prompt quiet frequency in sync with renderer settings.
onMainEvent(EVENTS.UPDATE_PROMPT_QUIET_FREQUENCY, (_, frequency: string) => {
  appUpdater.setUpdatePromptQuietFrequency(
    frequency as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NEVER',
  );
});

app.whenReady().then(async () => {
  await onFirstRunMaybe();

  appUpdater.start();

  initializeAppLifecycle(mb, contextMenu, protocol);

  // Configure window event handlers (Escape key, DevTools resize)
  configureWindowEvents(mb);

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
