const { notarize } = require('@electron/notarize');
const { AfterPackContext } = require('electron-builder');

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

  return await notarize({
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID_USERNAME,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_ID_TEAM_ID,
  });
};

module.exports = afterSign;
