const path = require('node:path');
const fs = require('node:fs');
const { AfterPackContext } = require('electron-builder');

const packageJson = require('../package.json');
const electronLanguages = packageJson.build.electronLanguages;

/**
 * @param {AfterPackContext} context
 */
const removeLocales = async (context) => {
  const appName = context.packager.appInfo.productFilename;
  const appOutDir = context.appOutDir;
  const platform = context.electronPlatformName;

  if (platform !== 'darwin') {
    return;
  }

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

exports.default = removeLocales;
