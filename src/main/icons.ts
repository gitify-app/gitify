import path from 'node:path';

export const TrayIcons = {
  active: getIconPath('tray-active.png'),
  activeWithUpdate: getIconPath('tray-active-update.png'),
  idle: getIconPath('tray-idleTemplate.png'),
  idleWithUpdate: getIconPath('tray-idle-update.png'),
  idleAlternate: getIconPath('tray-idle-white.png'),
  idleAlternateWithUpdate: getIconPath('tray-idle-white-update.png'),
  error: getIconPath('tray-error.png'),
};

function getIconPath(iconName: string) {
  return path.join(__dirname, '..', 'assets', 'images', iconName);
}
