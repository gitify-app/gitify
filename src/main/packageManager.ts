import fs from 'node:fs';
import path from 'node:path';

import { app } from 'electron';

import { APPLICATION } from '../shared/constants';
import { isMacOS } from '../shared/platform';

/** Package managers that we can detect as the owner of the installed app. */
export type PackageManager = 'Homebrew';

/** Homebrew cask that installs Gitify: https://formulae.brew.sh/cask/gitify */
const HOMEBREW_CASK_TOKEN = 'gitify';

/** Default Homebrew prefixes, for Apple Silicon and Intel respectively. */
const HOMEBREW_PREFIXES = ['/opt/homebrew', '/usr/local'];

/**
 * Detect the package manager that installed the running app, if any.
 *
 * @returns The package manager that owns this install, or `null` when the app was installed manually.
 */
export function detectPackageManager(): PackageManager | null {
  if (isMacOS() && isHomebrewCask()) {
    return 'Homebrew';
  }

  return null;
}

/**
 * Determine whether the running app bundle was installed by the Homebrew cask.
 *
 * A cask keeps `<prefix>/Caskroom/gitify/<version>/Gitify.app` as a symlink to the
 * bundle it installed (`/Applications/Gitify.app` by default). Resolving those
 * symlinks tells us whether Homebrew owns *this* copy of the app, rather than a
 * manually installed one running alongside a cask install.
 */
function isHomebrewCask(): boolean {
  const bundlePath = appBundlePath();

  if (!bundlePath) {
    return false;
  }

  for (const prefix of homebrewPrefixes()) {
    const caskPath = path.join(prefix, 'Caskroom', HOMEBREW_CASK_TOKEN);

    for (const version of readDirectory(caskPath)) {
      const caskBundlePath = path.join(caskPath, version, `${APPLICATION.NAME}.app`);

      if (resolvePath(caskBundlePath) === bundlePath) {
        return true;
      }
    }
  }

  return false;
}

/**
 * The Homebrew prefixes to search for a cask install.
 *
 * `HOMEBREW_PREFIX` covers a custom prefix, though it is only set when the app was
 * launched from a shell that exported it - hence the standard prefixes as well.
 */
function homebrewPrefixes(): string[] {
  const customPrefix = process.env.HOMEBREW_PREFIX;

  return customPrefix ? [customPrefix, ...HOMEBREW_PREFIXES] : HOMEBREW_PREFIXES;
}

/**
 * The resolved path of the running application bundle, ie `/Applications/Gitify.app`.
 *
 * @returns The bundle path, or `null` if it cannot be resolved.
 */
function appBundlePath(): string | null {
  // `Gitify.app/Contents/MacOS/Gitify` -> `Gitify.app`
  return resolvePath(path.resolve(app.getPath('exe'), '..', '..', '..'));
}

/**
 * Read the entries of a directory, treating an unreadable directory as empty.
 */
function readDirectory(directoryPath: string): string[] {
  try {
    return fs.readdirSync(directoryPath);
  } catch {
    return [];
  }
}

/**
 * Resolve a path to its canonical location, following any symlinks.
 *
 * @returns The canonical path, or `null` if the path does not exist.
 */
function resolvePath(targetPath: string): string | null {
  try {
    return fs.realpathSync(targetPath);
  } catch {
    return null;
  }
}
