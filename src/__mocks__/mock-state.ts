import { Theme, AuthState, SettingsState } from '../types';
import { mockedUser, mockedEnterpriseAccounts } from './mockedData';

export const mockAccounts: AuthState = {
  token: 'token-123-456',
  enterpriseAccounts: mockedEnterpriseAccounts,
  user: mockedUser,
};

export const mockSettings: SettingsState = {
  participating: false,
  playSound: true,
  showNotifications: true,
  showBots: true,
  showNotificationsCountInTray: false,
  openAtStartup: false,
  theme: Theme.SYSTEM,
  colors: false,
  markAsDoneOnOpen: false,
  showAccountHostname: false,
};
