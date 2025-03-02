const { notarize } = require('@electron/notarize');
const { AfterPackContext } = require('electron-builder');

const packageJson = require('../package.json');
const appBundleId = packageJson.build.appId;

function logNotarizingProgress(msg) {
  // biome-ignore lint/suspicious/noConsoleLog: log notarizing progress
  console.log(`  • notarizing        ${msg}`);
}

/**
 * @param {AfterPackContext} context
 */
const notarizeApp = async (context) => {
  const { electronPlatformName, appOutDir } = context;
  const appName = context.packager.appInfo.productFilename;
  const isMacOS = electronPlatformName === 'darwin';
  const shouldNotarize = process.env.NOTARIZE === 'true';

  if (!shouldNotarize || !isMacOS) {
    logNotarizingProgress(
      'either should not notarize or not building for macOS',
    );
    return;
  }

  logNotarizingProgress('process started');

  return await notarize({
    appBundleId,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID_USERNAME,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_ID_TEAM_ID,
    tool: 'notarytool',
  });
};

exports.default = notarizeApp;
