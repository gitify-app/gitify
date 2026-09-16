import path from 'node:path';

import { isLinux } from '../shared/platform';

const isGnome =
  isLinux() && (process.env.XDG_CURRENT_DESKTOP ?? '').toUpperCase().split(':').includes('GNOME');

export const TrayIcons = {
  active: getIconPath('tray-active.png'),
  idle: getIconPath(isGnome ? 'tray-idle-white.png' : 'tray-idleTemplate.png'),
  idleAlternate: getIconPath('tray-idle-white.png'),
  error: getIconPath('tray-error.png'),
  offline: getIconPath('tray-offline.png'),
};

function getIconPath(iconName: string) {
  return path.resolve(__dirname, 'assets', 'images', iconName);
}
