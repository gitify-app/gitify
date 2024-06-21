import {
  type Account,
  type AuthState,
  type GitifyState,
  type GitifyUser,
  GroupBy,
  type Hostname,
  type SettingsState,
  Theme,
  type Token,
} from '../types';
import type { EnterpriseAccount } from '../utils/auth/types';
import Constants from '../utils/constants';

export const mockEnterpriseAccounts: EnterpriseAccount[] = [
  {
    hostname: 'github.gitify.io' as Hostname,
    token: '1234568790' as Token,
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
  token: 'token-123-456' as Token,
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
};

export const mockOAuthAccount: Account = {
  platform: 'GitHub Enterprise Server',
  method: 'OAuth App',
  token: '1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
};

export const mockGitHubCloudAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456' as Token,
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
};

export const mockGitHubEnterpriseServerAccount: Account = {
  platform: 'GitHub Enterprise Server',
  method: 'Personal Access Token',
  token: '1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
};

export const mockGitHubAppAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'GitHub App',
  token: '987654321' as Token,
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
};

export const mockAuth: AuthState = {
  accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
};

export const mockToken = 'token-123-456' as Token;

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
  keyboardShortcut: true,
  groupBy: GroupBy.REPOSITORY,
  filterReasons: null,
};

export const mockState: GitifyState = {
  auth: mockAuth,
  settings: mockSettings,
};
