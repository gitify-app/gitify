import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { app, shell } from 'electron';
import log from 'electron-log';
import type { Menubar } from 'menubar';

import { APPLICATION } from '../shared/constants';
import { logError, logInfo } from '../shared/logger';

export function isDevMode() {
  return !app.isPackaged;
}

export function takeScreenshot(mb: Menubar) {
  const date = new Date();
  const dateStr = date.toISOString().replaceAll(':', '-');

  const capturedPicFilePath = path.join(
    os.homedir(),
    `${dateStr}-${APPLICATION.NAME}-screenshot.png`,
  );
  mb.window.capturePage().then((img) => {
    fs.writeFile(capturedPicFilePath, img.toPNG(), () =>
      logInfo('takeScreenshot', `Screenshot saved ${capturedPicFilePath}`),
    );
  });
}

export function openLogsDirectory() {
  const filePath = log.transports.file?.getFile()?.path;

  if (!filePath) {
    logError(
      'openLogsDirectory',
      'Could not find log directory!',
      new Error('Directory not found'),
    );
    return;
  }

  const logDirectory = path.dirname(filePath);

  shell.openPath(logDirectory);
}
