import {
  type Account,
  type AuthState,
  type GitifyState,
  type GitifyUser,
  type SettingsState,
  Theme,
} from '../types';
import type { EnterpriseAccount } from '../utils/auth/types';
import type { HostName } from '../utils/branded-types';
import Constants from '../utils/constants';

export const mockEnterpriseAccounts: EnterpriseAccount[] = [
  {
    hostname: 'github.gitify.io' as HostName,
    token: '1234568790',
  },
];

export const mockGitifyUser: GitifyUser = {
  login: 'octocat',
  name: 'Mona Lisa Octocat',
  id: 123456789,
};

export const mockPersonalAccessTokenAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456',
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
};

export const mockOAuthAccount: Account = {
  platform: 'GitHub Enterprise Server',
  method: 'OAuth App',
  token: '1234568790',
  hostname: 'github.gitify.io' as HostName,
  user: mockGitifyUser,
};

export const mockGitHubCloudAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456',
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
};

export const mockGitHubEnterpriseServerAccount: Account = {
  platform: 'GitHub Enterprise Server',
  method: 'Personal Access Token',
  token: '1234568790',
  hostname: 'github.gitify.io' as HostName,
  user: mockGitifyUser,
};

export const mockGitHubAppAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'GitHub App',
  token: '987654321',
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
};

export const mockAuth: AuthState = {
  accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
};

export const mockToken = 'token-123-456';

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
  showPills: true,
};

export const mockState: GitifyState = {
  auth: mockAuth,
  settings: mockSettings,
};
