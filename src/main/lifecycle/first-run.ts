import fs from 'node:fs';
import path from 'node:path';

import { app, dialog } from 'electron';

import { APPLICATION } from '../../shared/constants';
import { logError } from '../../shared/logger';
import { isMacOS } from '../../shared/platform';

import { isDevMode } from '../utils';

/**
 * On first launch, write the first-run marker file and prompt macOS users
 * to move the app to the Applications folder. No-ops on subsequent launches.
 */
export async function onFirstRunMaybe() {
  if (checkAndMarkFirstRun()) {
    await promptMoveToApplicationsFolder();
  }
}

/**
 * Ask user if the app should be moved to the applications folder (macOS).
 */
async function promptMoveToApplicationsFolder() {
  if (!isMacOS()) {
    return;
  }

  if (isDevMode() || app.isInApplicationsFolder()) {
    return;
  }

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

/**
 * Returns the absolute path to the first-run marker file in the user data directory.
 */
const getConfigPath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'FirstRun', APPLICATION.FIRST_RUN_FOLDER);
};

/**
 * Determine if this is the first run of the application by checking for the existence of a specific file.
 *
 * @returns true if this is the first run, false otherwise
 */
function checkAndMarkFirstRun(): boolean {
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
    logError(
      'checkAndMarkFirstRun',
      'Unable to write firstRun file',
      err as Error,
    );
  }

  return true;
}
