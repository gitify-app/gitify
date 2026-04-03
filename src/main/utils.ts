import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { app, shell } from 'electron';
import log from 'electron-log';
import type { Menubar } from 'menubar';

import { APPLICATION } from '../shared/constants';
import { logError, logInfo } from '../shared/logger';

/**
 * Returns true when the app is running in development mode (i.e. not packaged).
 */
export function isDevMode(): boolean {
  return !app.isPackaged;
}

/**
 * Capture the current window contents and save a PNG file to the user's home directory.
 * The filename includes an ISO timestamp and the application name.
 * @param mb - The menubar instance whose window is captured.
 */
export function takeScreenshot(mb: Menubar) {
  const date = new Date();
  const dateStr = date.toISOString().replaceAll(':', '-');

  const capturedPicFilePath = path.join(
    os.homedir(),
    `${dateStr}-${APPLICATION.NAME}-screenshot.png`,
  );

  if (!mb.window) {
    return;
  }

  mb.window.capturePage().then((img) => {
    fs.writeFile(capturedPicFilePath, img.toPNG(), () =>
      logInfo('takeScreenshot', `Screenshot saved ${capturedPicFilePath}`),
    );
  });
}

/**
 * Open the directory containing the application log file in the OS file manager.
 * Logs an error if the log file path cannot be resolved.
 */
export function openLogsDirectory() {
  const logFilePath = log.transports.file?.getFile()?.path;

  if (!logFilePath) {
    logError(
      'openLogsDirectory',
      'Could not find log directory!',
      new Error('Directory not found'),
    );
    return;
  }

  const logDirectory = path.dirname(logFilePath);
  shell.openPath(logDirectory);
}
