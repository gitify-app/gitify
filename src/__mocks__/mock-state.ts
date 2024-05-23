import { type AuthState, type SettingsState, Theme } from '../types';
import Constants from '../utils/constants';
import { mockedEnterpriseAccounts, mockedUser } from './mockedData';

export const mockAccounts: AuthState = {
  accounts: [
    {
      platform: 'GitHub Cloud',
      method: 'Personal Access Token',
      token: 'token-123-456',
      hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
      user: mockedUser,
    },
    {
      platform: 'GitHub Enterprise Server',
      method: 'OAuth App',
      token: '1234568790',
      hostname: 'github.gitify.io',
      user: mockedUser,
    },
  ],
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
  detailedNotifications: true,
  markAsDoneOnOpen: false,
  showAccountHostname: false,
  delayNotificationState: false,
};
