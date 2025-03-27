const { notarize } = require('@electron/notarize');
const { AfterPackContext } = require('electron-builder');

const builderConfig = require('../config/electron-builder');
const appBundleId = builderConfig.appId;

function logAfterSignProgress(msg) {
  // biome-ignore lint/suspicious/noConsoleLog: log notarizing progress
  console.log(`  • [afterSign]: ${msg}`);
}

/**
 * @param {AfterPackContext} context
 */
const afterSign = async (context) => {
  logAfterSignProgress('Starting...');

  const { appOutDir } = context;
  const appName = context.packager.appInfo.productFilename;
  const shouldNotarize = process.env.NOTARIZE === 'true';

  if (!shouldNotarize) {
    logAfterSignProgress(
      'skipping notarize step as NOTARIZE env flag was not set',
    );
    return;
  }

  notarizeApp(appName, appOutDir);

  logAfterSignProgress('Completed');
};

/**
 * Notarizes the application
 * @param {string} appOutDir
 * @param {string} appName
 */
const notarizeApp = (appOutDir, appName) => {
  logAfterSignProgress('notarizing app');

  return notarize({
    appBundleId,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID_USERNAME,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_ID_TEAM_ID,
    tool: 'notarytool',
  });
};

module.exports = afterSign;
