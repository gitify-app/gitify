const path = require('node:path');
const fs = require('node:fs');

const builderConfig = require('../electron-builder');
const electronLanguages = builderConfig.electronLanguages;

function logAfterPackProgress(msg) {
  // biome-ignore lint/suspicious/noConsole: log notarizing progress
  console.log(`  • [afterPack]: ${msg}`);
}

/**
 * @param {import('electron-builder').AfterPackContext} context
 */
const afterPack = async (context) => {
  logAfterPackProgress('Starting...');

  const appName = context.packager.appInfo.productFilename;
  const appOutDir = context.appOutDir;
  const platform = context.electronPlatformName;

  if (platform === 'darwin') {
    removeUnusedLocales(appOutDir, appName);
  }

  logAfterPackProgress('Completed');
};

/**
 * Removes unused locales for macOS builds.
 * @param {string} appOutDir
 * @param {string} appName
 */
const removeUnusedLocales = (appOutDir, appName) => {
  logAfterPackProgress('removing unused locales');

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

exports.default = afterPack;
