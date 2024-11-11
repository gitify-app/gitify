import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { dialog, shell } from 'electron';
import log from 'electron-log';
import type { Menubar } from 'menubar';

export function takeScreenshot(mb: Menubar) {
  const date = new Date();
  const dateStr = date.toISOString().replace(/:/g, '-');

  const capturedPicFilePath = `${os.homedir()}/${dateStr}-gitify-screenshot.png`;
  mb.window.capturePage().then((img) => {
    fs.writeFile(capturedPicFilePath, img.toPNG(), () =>
      log.info(`Screenshot saved ${capturedPicFilePath}`),
    );
  });
}

export function resetApp(mb: Menubar) {
  const cancelButtonId = 0;
  const resetButtonId = 1;

  const response = dialog.showMessageBoxSync(mb.window, {
    type: 'warning',
    title: 'Reset Gitify',
    message:
      'Are you sure you want to reset Gitify? You will be logged out of all accounts',
    buttons: ['Cancel', 'Reset'],
    defaultId: cancelButtonId,
    cancelId: cancelButtonId,
  });

  if (response === resetButtonId) {
    mb.window.webContents.send('gitify:reset-app');
    mb.app.quit();
  }
}

export function openLogsDirectory() {
  const logDirectory = path.dirname(log.transports.file?.getFile()?.path);

  if (!logDirectory) {
    log.error('Could not find log directory!');
    return;
  }

  shell.openPath(logDirectory);
}
