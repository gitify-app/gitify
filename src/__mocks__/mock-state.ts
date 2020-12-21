import { Appearance, SettingsState } from '../types';

export const mockSettings: SettingsState = {
  participating: false,
  playSound: true,
  showNotifications: true,
  markOnClick: false,
  openAtStartup: false,
  appearance: Appearance.SYSTEM,
};
