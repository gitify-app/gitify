import path from 'node:path';

export const TrayIcons = {
  active: getIconPath('tray-active.png'),
  idle: getIconPath('tray-idleTemplate.png'),
  idleAlternate: getIconPath('tray-idle-white.png'),
  error: getIconPath('tray-error.png'),
  offline: getIconPath('tray-offline.png'),
};

function getIconPath(iconName: string) {
  return path.resolve(__dirname, 'assets', 'images', iconName);
}
