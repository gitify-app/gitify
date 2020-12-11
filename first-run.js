const { app, dialog } = require('electron');

const fs = require('fs-extra');
const path = require('path');

async function onFirstRunMaybe() {
  if (isFirstRun()) {
    await promptMoveToApplicationsFolder();
  }
}

// Ask user if the app should be moved to the applications folder.
async function promptMoveToApplicationsFolder() {
  if (process.platform !== 'darwin') return;

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
  return path.join(userDataPath, 'FirstRun', 'gitify-first-run');
};

// Whether or not the app is being run for the first time.
function isFirstRun() {
  const configPath = getConfigPath();

  try {
    if (fs.existsSync(configPath)) {
      return false;
    }

    fs.outputFileSync(configPath, '');
  } catch (error) {
    console.warn(`First run: Unable to write firstRun file`, error);
  }

  return true;
}

module.exports = { onFirstRunMaybe };
