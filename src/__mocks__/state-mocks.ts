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

const mockAppearanceSettings = {
  theme: Theme.SYSTEM,
  zoomPercentage: 100,
  detailedNotifications: true,
  showPills: true,
  showNumber: true,
  showAccountHostname: false,
};

const mockNotificationSettings = {
  groupBy: GroupBy.REPOSITORY,
  participating: false,
  markAsDoneOnOpen: false,
  delayNotificationState: false,
};

const mockSystemSettings = {
  keyboardShortcut: true,
  showNotificationsCountInTray: false,
  showNotifications: true,
  playSound: true,
  openAtStartup: false,
};

const mockFilters = {
  hideBots: false,
  filterReasons: [],
};

export const mockSettings: SettingsState = {
  ...mockAppearanceSettings,
  ...mockNotificationSettings,
  ...mockSystemSettings,
  ...mockFilters,
};

export const mockState: GitifyState = {
  auth: mockAuth,
  settings: mockSettings,
};
