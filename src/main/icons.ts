import path from 'node:path';

import { nativeTheme } from 'electron';

import type { TrayIconAppearance } from '../shared/events';
import { isMacOS, isWindows } from '../shared/platform';

export const TrayIcons = {
  active: getIconPath('tray-active.png'),
  idle: getIconPath('tray-idleTemplate.png'),
  light: getIconPath('tray-idle-white.png'),
  dark: getIconPath('tray-idle-black.png'),
  error: getIconPath('tray-error.png'),
  offline: getIconPath('tray-offline.png'),
};

export function getIdleTrayIcon(appearance: TrayIconAppearance): string {
  if (appearance !== 'auto') {
    return TrayIcons[appearance];
  }
  if (isMacOS()) {
    return TrayIcons.idle;
  }
  if (isWindows()) {
    return nativeTheme.shouldUseDarkColorsForSystemIntegratedUI ? TrayIcons.light : TrayIcons.dark;
  }
  // Linux does not expose the panel's colour scheme through Electron.
  return TrayIcons.light;
}

function getIconPath(iconName: string) {
  return path.resolve(__dirname, 'assets', 'images', iconName);
}
