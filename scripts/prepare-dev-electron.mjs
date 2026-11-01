#!/usr/bin/env node
/**
 * Prepare a Gitify-branded development Electron bundle.
 *
 * Development runs from Electron.app, whose generic bundle identity makes
 * macOS launch the unbranded default app when a native notification is
 * activated. Copying the runtime bundle to a Gitify-branded location keeps
 * notification activation inside the running app.
 *
 * The copy lives in the user cache rather than the checkout: Launch Services
 * ignores applications under the temporary directory, and the notification
 * daemon resolves the sender through Launch Services. A cache outside the
 * checkout also keeps one stable bundle across worktrees instead of a new
 * identity for every path.
 *
 * Returns the directory to use with `ELECTRON_OVERRIDE_DIST_PATH`.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
// Bump when the prepared bundle changes (branding, signing, layout) so a cache
// shared with other checkouts and branches is rebuilt instead of reused.
const MARKER_VERSION = 1;
const LSREGISTER =
  '/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister';

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
  const cacheRoot = path.join(os.homedir(), 'Library', 'Caches', 'gitify-dev');
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

  if (!isPrepared(markerPath, marker, targetApp)) {
    fs.rmSync(cacheRoot, { recursive: true, force: true });
    fs.mkdirSync(cacheRoot, { recursive: true });

    // ditto preserves the framework symlinks inside Electron.app.
    execFileSync('ditto', [sourceApp, targetApp], { stdio: 'inherit' });

    brandBundle(targetApp);
    signBundle(targetApp, identity);

    fs.writeFileSync(markerPath, `${JSON.stringify(marker, null, 2)}\n`);
    console.log(`[dev-electron] prepared ${DEV_BUNDLE_NAME} (${DEV_BUNDLE_IDENTIFIER})`);
  }

  // `ELECTRON_OVERRIDE_DIST_PATH` executes the binary directly rather than
  // going through `open`, so the copy never gets the Launch Services
  // registration that `open` would perform. Register on every launch, because
  // the record is dropped when the cache directory is removed.
  registerBundle(targetApp);

  return cacheRoot;
}

/**
 * Register the prepared bundle with Launch Services.
 *
 * Without this registration the notification daemon cannot identify the
 * running process ("Failed to find or validate client"), and every
 * notification fails with "Notifications are not allowed for this
 * application" even though the bundle is correctly signed.
 *
 * @param {string} appPath - Absolute path of the prepared `.app` bundle.
 */
function registerBundle(appPath) {
  try {
    execFileSync(LSREGISTER, ['-f', appPath], { stdio: 'ignore' });
  } catch (error) {
    // Notifications are the only feature that depends on this registration,
    // so keep development usable and let the main process log any failures.
    console.warn(
      `[dev-electron] could not register ${DEV_BUNDLE_NAME} with Launch Services:`,
      error instanceof Error ? error.message : error,
    );
  }
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
    // The key is absent from a fresh Electron bundle, so `Set` fails and
    // PlistBuddy prints an expected "Does Not Exist" error. Discard it and add
    // the key below instead.
    execFileSync('/usr/libexec/PlistBuddy', ['-c', `Set :${key} ${value}`, plist], {
      stdio: ['ignore', 'ignore', 'ignore'],
    });
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
