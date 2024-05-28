import {
  type AuthState,
  type EnterpriseAccount,
  type GitifyUser,
  type SettingsState,
  Theme,
} from '../types';

export const mockEnterpriseAccounts: EnterpriseAccount[] = [
  {
    hostname: 'github.gitify.io',
    token: '1234568790',
  },
];

export const mockUser: GitifyUser = {
  login: 'octocat',
  name: 'Mona Lisa Octocat',
  id: 123456789,
};

export const mockAccounts: AuthState = {
  token: 'token-123-456',
  enterpriseAccounts: mockEnterpriseAccounts,
  user: mockUser,
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
