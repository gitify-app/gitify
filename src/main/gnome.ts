import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import { app } from 'electron';

import type { GnomeExtensionState } from '../shared/events';
import { logError, toError } from '../shared/logger';

const UUID = 'tray-position@gitify.app';

const run = promisify(execFile);

function installPath(): string {
  const dataHome = process.env.XDG_DATA_HOME || path.join(app.getPath('home'), '.local', 'share');

  return path.join(dataHome, 'gnome-shell', 'extensions', UUID);
}

function bundlePath(): string {
  const root = app.isPackaged ? process.resourcesPath : app.getAppPath();

  return path.join(root, 'gnome-extension', UUID);
}

function isKnownToShell(): Promise<boolean> {
  return run('gnome-extensions', ['info', UUID]).then(
    () => true,
    () => false,
  );
}

function isActive(): Promise<boolean> {
  return run('gnome-extensions', ['list', '--user', '--active', '--quiet']).then(
    ({ stdout }) => stdout.split('\n').includes(UUID),
    () => false,
  );
}

/** @returns State of the bundled extension in the running shell. */
export async function getExtensionState(): Promise<GnomeExtensionState> {
  if (!fs.existsSync(installPath())) {
    return 'not-installed';
  }

  // The shell only learns of new extensions at session start.
  if (!(await isKnownToShell())) {
    return 'pending-session-restart';
  }

  return (await isActive()) ? 'active' : 'inactive';
}

/** @returns State after copying the bundled extension into place and enabling it. */
export async function installExtension(): Promise<GnomeExtensionState> {
  try {
    await fs.promises.cp(bundlePath(), installPath(), { recursive: true });
  } catch (err) {
    logError('gnome:installExtension', 'Unable to install the extension', toError(err));
    return 'error';
  }

  // Enabling fails until the shell has loaded the extension, hence the retry
  // offered by the `inactive` state.
  return enableExtension();
}

/** @returns State after asking GNOME to enable the extension. */
export async function enableExtension(): Promise<GnomeExtensionState> {
  await run('gnome-extensions', ['enable', UUID]).catch((err) =>
    logError('gnome:enableExtension', 'Unable to enable the extension', toError(err)),
  );

  return getExtensionState();
}
