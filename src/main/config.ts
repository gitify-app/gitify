import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { BrowserWindowConstructorOptions } from 'electron';

import { APPLICATION } from '../shared/constants';

import { isDevMode } from './utils';

/**
 * Resolved file-system and URL paths used throughout the main process.
 */
export const Paths = {
  preload: path.resolve(__dirname, 'preload.js'),

  get indexHtml(): string {
    return isDevMode()
      ? process.env.VITE_DEV_SERVER_URL || ''
      : pathToFileURL(path.resolve(__dirname, 'index.html')).href;
  },

  get notificationSound(): string {
    return pathToFileURL(
      path.resolve(
        __dirname,
        'assets',
        'sounds',
        APPLICATION.NOTIFICATION_SOUND,
      ),
    ).href;
  },

  get twemojiFolder(): string {
    return pathToFileURL(path.resolve(__dirname, 'assets', 'images', 'twemoji'))
      .href;
  },
};

/**
 * Default browser window construction options for the menubar popup.
 */
export const WindowConfig: BrowserWindowConstructorOptions = {
  width: 500,
  height: 400,
  minWidth: 500,
  minHeight: 400,
  resizable: false,
  /** Hide the app from the Windows taskbar */
  skipTaskbar: true,
  webPreferences: {
    preload: Paths.preload,
    contextIsolation: true,
    nodeIntegration: false,
    /** Disable web security in development to allow CORS requests */
    webSecurity: !process.env.VITE_DEV_SERVER_URL,
    /**
     * Keep the renderer process active even when the window is hidden. This prevents
     * Chromium from throttling or freezing the renderer process, ensuring that the menubar
     * window remains responsive and up-to-date with the latest notification content on show.
     */
    backgroundThrottling: false,
  },
};
