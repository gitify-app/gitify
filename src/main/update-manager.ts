import { access, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

import type { UpdateManager } from '../shared/events';
import { logError, toError } from '../shared/logger';

interface Installation {
  platform: NodeJS.Platform;
  executablePath: string;
  resourcesPath: string;
  env: NodeJS.ProcessEnv;
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
      logError('update manager', `Cannot inspect ${file}`, toError(error));
    }
    return false;
  }
}

async function readMetadata(file: string): Promise<unknown> {
  if (!(await exists(file))) {
    return null;
  }
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    logError('update manager', `Cannot read ${file}`, toError(error));
    return null;
  }
}

async function detectLinuxUpdateManager({
  env,
}: Pick<Installation, 'env'>): Promise<UpdateManager | null> {
  if (env.FLATPAK_ID || (await exists('/.flatpak-info'))) {
    return 'Flatpak';
  }
  if (env.SNAP && env.SNAP_NAME) {
    return 'Snap';
  }
  return null;
}

async function detectWindowsUpdateManager({
  executablePath,
}: Pick<Installation, 'executablePath'>): Promise<UpdateManager | null> {
  const directory = path.dirname(await realpath(executablePath));
  for (const prefix of ['scoop-', '']) {
    const install = await readMetadata(path.join(directory, `${prefix}install.json`));
    const manifest = await readMetadata(path.join(directory, `${prefix}manifest.json`));
    if (
      install &&
      typeof install === 'object' &&
      'architecture' in install &&
      typeof install.architecture === 'string' &&
      manifest &&
      typeof manifest === 'object' &&
      'version' in manifest &&
      typeof manifest.version === 'string'
    ) {
      return 'Scoop';
    }
  }

  return null;
}

/**
 * Detect a package manager that owns updates for this installation.
 *
 * Only Scoop, Flatpak, and Snap are detected; other installations, including
 * deb, rpm, and Homebrew packages, keep Gitify's own updater. Packagers can opt
 * in with a `disable-auto-updates` resource marker or `GITIFY_DISABLE_AUTO_UPDATE=1`.
 *
 * @param installation - The running installation's platform, paths, and environment.
 * @returns The package manager that owns updates, or `null` when Gitify updates itself.
 */
export async function detectUpdateManager(
  installation: Installation,
): Promise<UpdateManager | null> {
  const { platform, resourcesPath, env } = installation;

  if (
    env.GITIFY_DISABLE_AUTO_UPDATE === '1' ||
    (await exists(path.join(resourcesPath, 'disable-auto-updates')))
  ) {
    return 'packager';
  }

  if (platform === 'linux') {
    return detectLinuxUpdateManager(installation);
  }

  if (platform === 'win32') {
    return detectWindowsUpdateManager(installation);
  }

  return null;
}
