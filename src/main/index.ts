import { execFileSync } from 'node:child_process';

import { app } from 'electron';
import log from 'electron-log';
import { menubar } from 'menubar';

// On Linux tiling WMs (Hyprland, Sway, i3, etc.), Electron fails to detect the
// correct password storage backend because XDG_CURRENT_DESKTOP doesn't match a
// known DE. Query D-Bus for an active Secret Service provider and, if found, tell
// Electron to use gnome-libsecret so safeStorage works correctly.
if (
  process.platform === 'linux' &&
  !app.commandLine.hasSwitch('password-store')
) {
  try {
    execFileSync(
      'dbus-send',
      [
        '--session',
        '--dest=org.freedesktop.DBus',
        '--type=method_call',
        '--print-reply',
        '/org/freedesktop/DBus',
        'org.freedesktop.DBus.GetNameOwner',
        'string:org.freedesktop.secrets',
      ],
      { timeout: 2000, stdio: 'ignore' },
    );
    app.commandLine.appendSwitch('password-store', 'gnome-libsecret');
  } catch {
    // D-Bus not available or no Secret Service provider — let Electron fall back
  }
}

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
