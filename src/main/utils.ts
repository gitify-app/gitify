import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { dialog, shell } from 'electron';
import log from 'electron-log';
import type { Menubar } from 'menubar';

import { APPLICATION } from '../shared/constants';
import { namespacedEvent } from '../shared/events';
import { logError, logInfo } from '../shared/logger';

export function takeScreenshot(mb: Menubar) {
  const date = new Date();
  const dateStr = date.toISOString().replace(/:/g, '-');

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

export function resetApp(mb: Menubar) {
  const cancelButtonId = 0;
  const resetButtonId = 1;

  const response = dialog.showMessageBoxSync(mb.window, {
    type: 'warning',
    title: `Reset ${APPLICATION.NAME}`,
    message: `Are you sure you want to reset ${APPLICATION.NAME}? You will be logged out of all accounts`,
    buttons: ['Cancel', 'Reset'],
    defaultId: cancelButtonId,
    cancelId: cancelButtonId,
  });

  if (response === resetButtonId) {
    mb.window.webContents.send(namespacedEvent('reset-app'));
    mb.app.quit();
  }
}

export function openLogsDirectory() {
  const logDirectory = path.dirname(log.transports.file?.getFile()?.path);

  if (!logDirectory) {
    logError(
      'openLogsDirectory',
      'Could not find log directory!',
      new Error('Directory not found'),
    );
    return;
  }

  shell.openPath(logDirectory);
}
