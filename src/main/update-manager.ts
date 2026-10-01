import { execFile } from 'node:child_process';
import { access, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

import { logError, toError } from '../shared/logger';

interface Installation {
  platform: NodeJS.Platform;
  appPath: string;
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

function ownsFile(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: 1500, windowsHide: true }, (error, stdout) => {
      if (error && error.code !== 'ENOENT' && error.code !== 1) {
        logError('update manager', `Cannot query ${command} ownership`, error);
      }
      resolve(!error && stdout.trim().length > 0);
    });
  });
}

export async function detectUpdateManager(installation: Installation): Promise<string | null> {
  const { platform, appPath, executablePath, resourcesPath, env } = installation;

  if (
    env.GITIFY_DISABLE_AUTO_UPDATE === '1' ||
    (await exists(path.join(resourcesPath, 'disable-auto-updates')))
  ) {
    return 'your package manager';
  }

  if (platform === 'linux') {
    if (env.FLATPAK_ID || (await exists('/.flatpak-info'))) {
      return 'Flatpak';
    }
    if (env.SNAP && env.SNAP_NAME) {
      return 'Snap';
    }

    // System Electron can run an independently installed app, so query the app's files.
    const file = appPath.endsWith('.asar') ? appPath : path.join(appPath, 'package.json');
    for (const [command, args, manager] of [
      ['pacman', ['-Qqo', '--', file], 'pacman'],
      ['dpkg-query', ['-S', file], 'dpkg'],
      ['rpm', ['-qf', '--', file], 'RPM'],
    ] satisfies Array<[string, string[], string]>) {
      if (await ownsFile(command, args)) {
        return manager;
      }
    }
  }

  if (platform === 'win32') {
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
  }

  return null;
}
