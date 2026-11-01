#!/usr/bin/env node
/**
 * Prepare a Gitify-branded development Electron bundle.
 *
 * Development runs from Electron.app, whose generic bundle identity makes
 * macOS launch the unbranded default app when a native notification is
 * activated. Copying the runtime bundle to a cache directory with a Gitify dev
 * identifier keeps notification activation inside the running app.
 *
 * Returns the directory to use with `ELECTRON_OVERRIDE_DIST_PATH`.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const MARKER_VERSION = 1;

export const DEV_BUNDLE_IDENTIFIER = 'com.electron.gitify.dev';
export const DEV_BUNDLE_NAME = 'Gitify Dev';

/**
 * Prepare and return the override directory, or undefined when the current
 * platform does not need a branded bundle.
 *
 * @returns {string | undefined}
 */
export function prepareDevElectronBundle() {
  if (process.platform !== 'darwin') {
    return undefined;
  }

  const require = createRequire(import.meta.url);
  const electronPackage = path.dirname(require.resolve('electron/package.json'));
  const electronBinary = require('electron');
  const sourceApp = electronBinary?.replace(/\/Contents\/MacOS\/Electron$/, '');
  const cacheRoot = path.join(repoRoot, 'node_modules', '.cache', 'gitify-dev');
  const targetApp = path.join(cacheRoot, 'Electron.app');
  const markerPath = path.join(cacheRoot, 'prepared.json');
  const electronVersion = JSON.parse(
    fs.readFileSync(path.join(electronPackage, 'package.json'), 'utf8'),
  ).version;
  const sourceMtime = fs.statSync(sourceApp).mtimeMs;
  const identity = resolveIdentity();
  const marker = {
    version: MARKER_VERSION,
    electronVersion,
    sourceMtime,
    identity,
  };

  if (isPrepared(markerPath, marker, targetApp)) {
    return cacheRoot;
  }

  fs.rmSync(cacheRoot, { recursive: true, force: true });
  fs.mkdirSync(cacheRoot, { recursive: true });

  // ditto preserves the framework symlinks inside Electron.app.
  execFileSync('ditto', [sourceApp, targetApp], { stdio: 'inherit' });

  brandBundle(targetApp);
  signBundle(targetApp, identity);

  fs.writeFileSync(markerPath, `${JSON.stringify(marker, null, 2)}\n`);
  console.log(`[dev-electron] prepared ${DEV_BUNDLE_NAME} (${DEV_BUNDLE_IDENTIFIER})`);

  return cacheRoot;
}

function isPrepared(markerPath, expected, targetApp) {
  if (!fs.existsSync(markerPath) || !fs.existsSync(targetApp)) {
    return false;
  }

  try {
    return (
      JSON.stringify(JSON.parse(fs.readFileSync(markerPath, 'utf8'))) === JSON.stringify(expected)
    );
  } catch {
    return false;
  }
}

function brandBundle(appPath) {
  const plist = path.join(appPath, 'Contents', 'Info.plist');
  const iconSource = path.join(repoRoot, 'assets', 'images', 'app-icon.icns');
  const iconName = 'gitify-dev.icns';

  setPlist(plist, 'CFBundleIdentifier', DEV_BUNDLE_IDENTIFIER);
  setPlist(plist, 'CFBundleName', DEV_BUNDLE_NAME);
  setPlist(plist, 'CFBundleDisplayName', DEV_BUNDLE_NAME);
  setPlist(plist, 'LSUIElement', 'true', 'bool');
  setPlist(plist, 'NSUserNotificationAlertStyle', 'alert');

  if (fs.existsSync(iconSource)) {
    fs.copyFileSync(iconSource, path.join(appPath, 'Contents', 'Resources', iconName));
    setPlist(plist, 'CFBundleIconFile', iconName);
  }
}

function signBundle(appPath, identity) {
  const entitlements = path.join(repoRoot, 'assets', 'entitlements.mac.plist');

  execFileSync(
    'codesign',
    [
      '--force',
      '--deep',
      '--options',
      'runtime',
      '--entitlements',
      entitlements,
      '--sign',
      identity,
      appPath,
    ],
    { stdio: 'inherit' },
  );
}

function setPlist(plist, key, value, type) {
  try {
    execFileSync('/usr/libexec/PlistBuddy', ['-c', `Set :${key} ${value}`, plist]);
  } catch {
    const command = type
      ? ['-c', `Add :${key} ${type} ${value}`, plist]
      : ['-c', `Add :${key} string ${value}`, plist];
    execFileSync('/usr/libexec/PlistBuddy', command);
  }
}

function resolveIdentity() {
  const requestedIdentity = process.env.GITIFY_DEV_SIGN_IDENTITY?.trim();

  if (requestedIdentity) {
    return requestedIdentity;
  }

  try {
    const identities = execFileSync('security', ['find-identity', '-v', '-p', 'codesigning'], {
      encoding: 'utf8',
    });

    return (
      identities.match(/"([^"]*Developer ID Application:[^"]*)"/)?.[1] ??
      identities.match(/"([^"]*Apple Development:[^"]*)"/)?.[1] ??
      '-'
    );
  } catch {
    return '-';
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const overrideDirectory = prepareDevElectronBundle();

  if (overrideDirectory) {
    console.log(overrideDirectory);
  }
}
