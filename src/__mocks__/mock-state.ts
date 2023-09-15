import { Appearance, AuthState, SettingsState } from '../types';
import { mockedUser } from './mockedData';

export const mockAccounts: AuthState = {
  token: 'token-123-456',
  enterpriseAccounts: [
    {
      token: 'token-gitify-123-456',
      hostname: 'github.gitify.io',
    },
  ],
  user: mockedUser,
};

export const mockSettings: SettingsState = {
  participating: false,
  playSound: true,
  showNotifications: true,
  markOnClick: false,
  openAtStartup: false,
  appearance: Appearance.SYSTEM,
  colors: false,
};
