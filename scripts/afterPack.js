const path = require('node:path');
const fs = require('node:fs');
const {
  flipFuses,
  FuseVersion,
  FuseV1Options,
} = require('@electron/fuses');

const builderConfig = require('../electron-builder');
const electronLanguages = builderConfig.electronLanguages;

function logAfterPackProgress(msg) {
  // oxlint-disable-next-line no-console -- log notarizing progress
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

  flipElectronFuses(appOutDir, appName, platform);

  logAfterPackProgress('Completed');
};

/**
 * Locates the packaged application binary for the current platform.
 *
 * @param {string} appOutDir
 * @param {string} appName
 * @param {string} platform electron-builder's platform key
 * @returns {string}
 */
const getExecutablePath = (appOutDir, appName, platform) => {
  switch (platform) {
    case 'darwin':
      return path.join(appOutDir, `${appName}.app`, 'Contents', 'MacOS', appName);
    case 'win32':
      return path.join(appOutDir, `${appName}.exe`);
    default:
      return path.join(appOutDir, appName);
  }
};

/**
 * Hardens the packaged binary by flipping Electron's fuse wire.
 *
 * Without this the app ships on fuse version 1, which leaves RunAsNode enabled
 * and every other switch at its permissive framework default. With RunAsNode on,
 * ELECTRON_RUN_AS_NODE=1 <app> starts the binary as a plain Node runtime,
 * dropping the Electron sandbox entirely.
 *
 * EnableEmbeddedAsarIntegrityValidation is deliberately NOT enabled here: it
 * requires the matching `asarIntegrity` build option, and enabling it without
 * that will stop the app launching.
 *
 * @param {string} appOutDir
 * @param {string} appName
 * @param {string} platform
 */
const flipElectronFuses = (appOutDir, appName, platform) => {
  logAfterPackProgress('flipping Electron fuses');

  const executablePath = getExecutablePath(appOutDir, appName, platform);

  if (!fs.existsSync(executablePath)) {
    logAfterPackProgress(
      `skipping fuses, executable not found: ${executablePath}`,
    );
    return;
  }

  // NOTE: @electron/fuses v2 takes (executablePath, config). v1.x took
  // (config, executablePath) -- swapping these throws at build time.
  flipFuses(executablePath, {
    version: FuseVersion.V1,

    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,
  });

  logAfterPackProgress('fuses flipped');
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
  const allLocales = fs.readdirSync(resourcesPath).filter((file) => file.endsWith('.lproj'));

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
