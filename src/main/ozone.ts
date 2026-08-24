import fs from 'node:fs';
import path from 'node:path';

import { app } from 'electron';

import { logError, logInfo, toError } from '../shared/logger';

/**
 * Marker file in the user data directory whose presence selects the X11
 * backend. The renderer owns every other setting via `localStorage`, which the
 * main process cannot read, and the Ozone platform has to be chosen before the
 * app is ready — long before a renderer exists. A file on disk is the only
 * state available that early, so this setting is mirrored here rather than
 * read from the settings store.
 */
const X11_MARKER_FILE = 'UseX11Backend';

const markerPath = (): string => path.join(app.getPath('userData'), X11_MARKER_FILE);

/**
 * Whether the user has opted into the X11 backend.
 */
export function isX11BackendEnabled(): boolean {
  try {
    return fs.existsSync(markerPath());
  } catch (err) {
    logError('isX11BackendEnabled', 'Unable to read X11 backend marker', toError(err));
    return false;
  }
}

/**
 * Persist the X11 backend preference. Takes effect on the next launch, since
 * the Ozone platform is fixed once the app has started.
 *
 * @param enabled - `true` to run under X11/XWayland, `false` to let Electron pick.
 */
export function setX11Backend(enabled: boolean): void {
  try {
    if (enabled) {
      fs.writeFileSync(markerPath(), '');
      return;
    }

    fs.rmSync(markerPath(), { force: true });
  } catch (err) {
    logError('setX11Backend', 'Unable to persist X11 backend preference', toError(err));
  }
}

/**
 * Force the X11 Ozone backend when the user has opted in.
 *
 * Must run before the app is ready. Electron 38+ defaults the platform hint to
 * `auto`, so a Wayland session gets a native Wayland client, where the
 * compositor owns window placement and the tray reports no coordinates. The
 * popup then opens centre-screen instead of under the tray icon. Running under
 * XWayland restores tray-anchored positioning at the cost of native Wayland
 * scaling, so it stays opt-in.
 */
export function applyOzonePlatform(): void {
  if (process.platform !== 'linux' || !isX11BackendEnabled()) {
    return;
  }

  app.commandLine.appendSwitch('ozone-platform', 'x11');
  logInfo('applyOzonePlatform', 'X11 backend enabled, forcing --ozone-platform=x11');
}
