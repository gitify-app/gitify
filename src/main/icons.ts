import path from 'node:path';

// Tray Icons
export const idleIcon = getIconPath('tray-idleTemplate.png');
export const idleUpdateIcon = getIconPath('tray-idle-update.png');
export const idleAlternateIcon = getIconPath('tray-idle-white.png');
export const idleAlternateUpdateIcon = getIconPath(
  'tray-idle-white-update.png',
);
export const activeIcon = getIconPath('tray-active.png');
export const activeUpdateIcon = getIconPath('tray-active-update.png');

function getIconPath(iconName: string) {
  return path.resolve(__dirname, '../assets/images', iconName);
}
