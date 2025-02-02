const path = require('node:path');
const fs = require('node:fs');
const { chmodSync, chownSync } = require('node:fs');
const { AfterPackContext } = require('electron-builder');

const packageJson = require('../package.json');
const electronLanguages = packageJson.build.electronLanguages;

/**
 * @param {AfterPackContext} context
 */
const afterPack = async (context) => {
  // biome-ignore lint/suspicious/noConsoleLog: disabled
  console.log('[afterPack]: Starting...');

  const appName = context.packager.appInfo.productFilename;
  const appOutDir = context.appOutDir;
  const platform = context.electronPlatformName;

  if (platform === 'darwin') {
    removeUnusedLocales(appOutDir, appName);
  } else if (platform === 'linux') {
    fixChromeSandboxPermissions(appOutDir);
  }

  // biome-ignore lint/suspicious/noConsoleLog: disabled
  console.log('[afterPack]: Completed');
};

/**
 * Removes unused locales for macOS builds.
 * @param {string} appOutDir
 * @param {string} appName
 */
const removeUnusedLocales = (appOutDir, appName) => {
  // biome-ignore lint/suspicious/noConsoleLog: disabled
  console.log('[afterPack]: removing unused locales');

  const resourcesPath = path.join(
    appOutDir,
    `${appName}.app`,
    'Contents',
    'Frameworks',
    'Electron Framework.framework',
    'Versions',
    'A',
    'Resources',
  );

  // Get all locale directories
  const allLocales = fs
    .readdirSync(resourcesPath)
    .filter((file) => file.endsWith('.lproj'));

  const langLocales = electronLanguages.map((lang) => `${lang}.lproj`);

  // Remove unused locales
  for (const locale of allLocales) {
    if (!langLocales.includes(locale)) {
      const localePath = path.join(resourcesPath, locale);
      fs.rmSync(localePath, { recursive: true });
    }
  }
};

/**
 * Fixes `chrome-sandbox` permissions for Linux builds.
 * @param {string} appOutDir
 */
const fixChromeSandboxPermissions = (appOutDir) => {
  // biome-ignore lint/suspicious/noConsoleLog: disabled
  console.log('[afterPack]: fix chrome sandbox permissions');

  const chromeSandboxPath = path.join(appOutDir, 'chrome-sandbox');

  try {
    chownSync(chromeSandboxPath, 0, 0); // Set root ownership
    chmodSync(chromeSandboxPath, 0o4755); // Set SUID bit
    // biome-ignore lint/suspicious/noConsoleLog: disabled
    console.log('[afterPack]: Fixed chrome-sandbox permissions');
  } catch (err) {
    console.error(
      '[afterPack]: Failed to set chrome-sandbox permissions:',
      err,
    );
  }
};

exports.default = afterPack;
