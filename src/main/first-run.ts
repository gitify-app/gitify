import fs from 'node:fs';
import path from 'node:path';
import { app, dialog } from 'electron';

import { APPLICATION } from '../shared/constants';
import { logError } from '../shared/logger';
import { isMacOS } from '../shared/platform';

export async function onFirstRunMaybe() {
  if (isFirstRun()) {
    await promptMoveToApplicationsFolder();
  }
}

// Ask user if the app should be moved to the applications folder.
async function promptMoveToApplicationsFolder() {
  if (!isMacOS()) return;

  const isDevMode = !!process.defaultApp;
  if (isDevMode || app.isInApplicationsFolder()) return;

  const { response } = await dialog.showMessageBox({
    type: 'question',
    buttons: ['Move to Applications Folder', 'Do Not Move'],
    defaultId: 0,
    message: 'Move to Applications Folder?',
  });

  if (response === 0) {
    app.moveToApplicationsFolder();
  }
}

const getConfigPath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'FirstRun', APPLICATION.FIRST_RUN_FOLDER);
};

// Whether or not the app is being run for the first time.
function isFirstRun() {
  const configPath = getConfigPath();

  try {
    if (fs.existsSync(configPath)) {
      return false;
    }

    const firstRunFolder = path.dirname(configPath);
    if (!fs.existsSync(firstRunFolder)) {
      fs.mkdirSync(firstRunFolder);
    }

    fs.writeFileSync(configPath, '');
  } catch (err) {
    logError('isFirstRun', 'Unable to write firstRun file', err);
  }

  return true;
}
