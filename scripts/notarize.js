const { notarize } = require('@electron/notarize');

const notarizeApp = async (context) => {
  const { electronPlatformName, appOutDir } = context;
  const appName = context.packager.appInfo.productFilename;
  const isMacOS = electronPlatformName === 'darwin';
  const shouldNotarize = process.env.NOTARIZE === 'true';

  if (!shouldNotarize || !isMacOS) {
    console.log(
      '  • notarizing      either should not notarize or not building for macOS',
    );
    return;
  }

  console.log('  • notarizing      started');

  return await notarize({
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID_USERNAME,
    appleIdPassword: process.env.APPLEID_PASSWORD,
    teamId: process.env.APPLEID_TEAM_ID,
    tool: 'notarytool',
  });
};

exports.default = notarizeApp;
