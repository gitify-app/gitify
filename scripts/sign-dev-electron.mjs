#!/usr/bin/env node
/**
 * Prepare the development Electron bundle for native notifications.
 *
 * Electron ships ad-hoc linker-signed, which macOS rejects for
 * UNUserNotificationCenter. A real codesign pass fixes that; ad-hoc signing is
 * enough for local testing. Runs automatically from `predev` on macOS.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

if (process.platform !== 'darwin') {
  process.exit(0);
}

const require = createRequire(import.meta.url);
const electronBinary = require('electron');
const electronApp = electronBinary?.replace(/\/Contents\/MacOS\/Electron$/, '');

if (!electronApp || !existsSync(electronApp)) {
  console.warn('[sign-dev] could not locate the development Electron bundle; skipping');
  process.exit(0);
}

const plist = path.join(electronApp, 'Contents', 'Info.plist');
const entitlements = path.join(repoRoot, 'assets', 'entitlements.mac.plist');

const requestedIdentity = process.env.GITIFY_DEV_SIGN_IDENTITY?.trim();
const identity = requestedIdentity || findIdentity() || '-';
const adHoc = identity === '-';

if (isPrepared(electronApp, plist, identity)) {
  console.log('[sign-dev] development Electron is already signed for notifications');
  process.exit(0);
}

setAlertStyle(plist);

console.log(
  adHoc
    ? '[sign-dev] signing development Electron ad-hoc for native notifications'
    : `[sign-dev] signing development Electron with ${identity}`,
);

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
    electronApp,
  ],
  { stdio: 'inherit' },
);

/** Prefer a Developer ID, then an Apple Development identity, when present. */
function findIdentity() {
  try {
    const identities = execFileSync('security', ['find-identity', '-v', '-p', 'codesigning'], {
      encoding: 'utf8',
    });

    return (
      identities.match(/"([^"]*Developer ID Application:[^"]*)"/)?.[1] ??
      identities.match(/"([^"]*Apple Development:[^"]*)"/)?.[1] ??
      null
    );
  } catch {
    return null;
  }
}

/** Skip re-signing when the bundle already has what notifications need. */
function isPrepared(app, plistPath, identity) {
  try {
    const verify = spawnSync('codesign', ['--verify', '--deep', app], { encoding: 'utf8' });

    if (verify.status !== 0) {
      return false;
    }

    const signature = spawnSync('codesign', ['-dv', '--verbose=2', app], { encoding: 'utf8' });
    const flags = `${signature.stdout}${signature.stderr}`;
    const alertStyle = execFileSync(
      '/usr/libexec/PlistBuddy',
      ['-c', 'Print :NSUserNotificationAlertStyle', plistPath],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );

    if (alertStyle.trim() !== 'alert') {
      return false;
    }

    return identity === '-'
      ? !flags.includes('linker-signed')
      : flags.includes(`Authority=${identity}`);
  } catch {
    return false;
  }
}

function setAlertStyle(plistPath) {
  try {
    execFileSync('/usr/libexec/PlistBuddy', [
      '-c',
      'Set :NSUserNotificationAlertStyle alert',
      plistPath,
    ]);
  } catch {
    execFileSync('/usr/libexec/PlistBuddy', [
      '-c',
      'Add :NSUserNotificationAlertStyle string alert',
      plistPath,
    ]);
  }
}
