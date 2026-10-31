import fs from 'node:fs';

import { app } from 'electron';

/**
 * Resolve the user data directory and keep development builds isolated from
 * installed ones.
 *
 * Packaged builds keep Electron's default (`<appData>/<package name>`) so
 * existing installs are never migrated. Development builds append `-dev`;
 * without it, an installed copy and `pnpm dev` share the same single-instance
 * lock (see `./startup.ts`) and cache files, so the dev instance quits on
 * launch.
 *
 * Must run at module load, before anything reads `userData` (the Ozone platform
 * selection and electron-log both resolve paths from it).
 *
 * @returns The user data directory in use.
 */
export function configureUserDataPath(): string {
  const userDataPath = app.getPath('userData');

  if (app.isPackaged) {
    return userDataPath;
  }

  const devUserDataPath = `${userDataPath}-dev`;
  fs.mkdirSync(devUserDataPath, { recursive: true });
  app.setPath('userData', devUserDataPath);

  return devUserDataPath;
}
