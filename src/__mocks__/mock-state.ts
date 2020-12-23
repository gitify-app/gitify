import { Appearance, AuthState, SettingsState } from '../types';

export const mockAccounts: AuthState = {
  token: 'token-123-456',
  enterpriseAccounts: [
    {
      token: 'token-gitify-123-456',
      hostname: 'github.gitify.io',
    },
  ],
};

export const mockSettings: SettingsState = {
  participating: false,
  playSound: true,
  showNotifications: true,
  markOnClick: false,
  openAtStartup: false,
  appearance: Appearance.SYSTEM,
};
