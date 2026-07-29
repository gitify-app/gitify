/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  productName: 'Gitify',
  appId: 'com.electron.gitify',
  copyright: 'Copyright © 2026 Gitify Team',
  asar: true,
  files: [
    'assets/images/*',
    'assets/sounds/*',
    'build/**/*',
    'LICENSE',
    'node_modules/**/*', // Ideally we would have !node_modules and let electron-builder prune deps
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
    extendInfo: {
      // Launch as a macOS agent app so no dock tile is ever created. Without
      // this the app starts as a regular dock app and `app.dock.hide()` has to
      // transform it after the fact, leaving a ~300ms window where the icon is
      // real; macOS can silently drop that transform and strand the icon for
      // the whole session, which only a restart clears (#3069).
      LSUIElement: true,
    },
    identity: 'Adam Setch (5KD23H9729)',
    type: 'distribution',
    notarize: false, // Handle notarization in afterSign.js
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
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
    icon: 'assets/images/app-icon.ico',
  },
  nsis: {
    oneClick: false,
    uninstallDisplayName: 'Gitify',
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
