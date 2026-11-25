/**
 * Targets that emitted an artifact, keyed by platform and target name.
 *
 * electron-builder builds every configured target, but a target that packs
 * nothing still leaves a green build. Record what actually produced an
 * artifact and compare it with the planned targets once the build finishes, so
 * the check follows `electron-builder.js` without a second list to maintain.
 *
 * @type {Set<string>}
 */
const emittedTargets = new Set();

const targetKey = (platform, target) => `${platform.name}:${target.name}`;

/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  productName: 'Gitify',
  appId: 'com.electron.gitify',
  copyright: 'Copyright © 2026 Gitify Team',
  asar: true,
  /**
   * Hardening switches baked into the packaged Electron binary. electron-builder
   * flips these after packing and before signing, so the code signature covers the
   * flipped binary. Left unset, every switch keeps its permissive Electron default.
   *
   * `scripts/verifyFuses.js` asserts these values against the built artifacts.
   */
  electronFuses: {
    runAsNode: false, // refuses ELECTRON_RUN_AS_NODE
    enableNodeOptionsEnvironmentVariable: false, // ignores NODE_OPTIONS / NODE_EXTRA_CA_CERTS
    enableNodeCliInspectArguments: false, // refuses --inspect and SIGUSR1
    enableEmbeddedAsarIntegrityValidation: true, // validates app.asar before loading it
    onlyLoadAppFromAsar: true, // no fallback to an adjacent app/ directory
    /**
     * Not a fuse: re-applies the ad-hoc macOS signature after flipping. Flipping
     * invalidates the ad-hoc signature Electron ships with, and Apple Silicon
     * refuses to launch a binary whose signature no longer validates. The build
     * workflow packages macOS unsigned (`-c.mac.identity=null`), so without this
     * the arm64 artifact is killed on launch. Signing builds re-sign afterwards,
     * which supersedes the ad-hoc signature.
     */
    resetAdHocDarwinSignature: true,
    // grantFileProtocolExtraPrivileges is deliberately left at its Electron default:
    // the renderer loads index.html over file://, so removing those privileges
    // breaks asset and sound loading.
    // enableCookieEncryption is left at its default: tokens are already encrypted
    // through safeStorage, and Gitify keeps no cookies worth protecting.
  },
  files: ['assets/images/*', 'assets/sounds/*', 'build/**/*', 'LICENSE', 'package.json'],
  electronLanguages: ['en'],
  mac: {
    category: 'public.app-category.developer-tools',
    icon: 'assets/images/app-icon.icns',
    extendInfo: {
      LSUIElement: true,
      // Required for extra action buttons on macOS notifications.
      NSUserNotificationAlertStyle: 'alert',
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
  artifactBuildCompleted: (event) => {
    if (event.target != null) {
      emittedTargets.add(targetKey(event.packager.platform, event.target));
    }
  },
  afterAllArtifactBuild: async (buildResult) => {
    const missing = [];

    for (const [platform, nameToTarget] of buildResult.platformToTargets) {
      for (const target of nameToTarget.values()) {
        // `dir` produces the unpacked app, not a distributable to upload.
        if (target.name === 'dir') {
          continue;
        }

        if (!emittedTargets.has(targetKey(platform, target))) {
          missing.push(`${platform.name}/${target.name}`);
        }
      }
    }

    if (missing.length > 0) {
      throw new Error(`electron-builder produced no artifact for: ${missing.join(', ')}`);
    }

    return [];
  },
};

module.exports = config;
