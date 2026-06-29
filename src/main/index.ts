import { app } from 'electron';
import log from 'electron-log';
import { menubar } from 'electron-menubar';

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
