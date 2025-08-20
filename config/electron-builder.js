const { Configuration } = require('electron-builder');

/**
 * @type {Configuration}
 */
const config = {
  productName: 'Gitify',
  appId: 'com.electron.gitify',
  copyright: 'Copyright © 2025 Gitify Team',
  asar: true,
  files: [
    'assets/images/*',
    'assets/sounds/*',
    'build/**/*',
    'LICENSE',
    'node_modules/**/*',
    'package.json',
  ],
  electronLanguages: ['en'],
  protocols: [
    {
      name: 'Gitify',
      schemes: ['gitify', 'gitify-dev'],
    },
  ],
  mac: {
    category: 'public.app-category.developer-tools',
    icon: 'assets/images/app-icon.icns',
    identity: 'Adam Setch (5KD23H9729)',
    type: 'distribution',
    notarize: false,
    target: {
      target: 'default',
      arch: ['universal'],
    },
    hardenedRuntime: true,
    entitlements: 'assets/entitlements.mac.plist',
    entitlementsInherit: 'assets/entitlements.mac.plist',
    gatekeeperAssess: false,
  },
  dmg: {
    icon: 'assets/images/app-icon.icns',
    sign: false,
  },
  win: {
    target: 'nsis',
    icon: 'assets/images/app-icon.ico',
  },
  nsis: {
    oneClick: false,
  },
  linux: {
    target: ['AppImage', 'deb', 'rpm'],
    category: 'Development',
    maintainer: 'Gitify Team',
  },
  publish: {
    provider: 'github',
    owner: 'gitify-app',
    repo: 'gitify',
  },
  afterSign: 'scripts/afterSign.js',
  afterPack: 'scripts/afterPack.js',
};

module.exports = config;
