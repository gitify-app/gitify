import {
  type Account,
  type AuthState,
  type GitifyState,
  type GitifyUser,
  GroupBy,
  type Hostname,
  type Link,
  OpenPreference,
  type SettingsState,
  Theme,
  type Token,
} from '../types';
import type { EnterpriseAccount } from '../utils/auth/types';
import { Constants } from '../utils/constants';

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
  avatar: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
};

export const mockPersonalAccessTokenAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456' as Token,
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
  hasRequiredScopes: true,
};

export const mockOAuthAccount: Account = {
  platform: 'GitHub Enterprise Server',
  method: 'OAuth App',
  token: '1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
  hasRequiredScopes: true,
};

export const mockGitHubCloudAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456' as Token,
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
  version: 'latest',
  hasRequiredScopes: true,
};

export const mockGitHubEnterpriseServerAccount: Account = {
  platform: 'GitHub Enterprise Server',
  method: 'Personal Access Token',
  token: '1234568790' as Token,
  hostname: 'github.gitify.io' as Hostname,
  user: mockGitifyUser,
  hasRequiredScopes: true,
};

export const mockGitHubAppAccount: Account = {
  platform: 'GitHub Cloud',
  method: 'GitHub App',
  token: '987654321' as Token,
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockGitifyUser,
  hasRequiredScopes: true,
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
  showAccountHeader: false,
};

const mockNotificationSettings = {
  groupBy: GroupBy.REPOSITORY,
  fetchAllNotifications: true,
  participating: false,
  markAsDoneOnOpen: false,
  markAsDoneOnUnsubscribe: false,
  delayNotificationState: false,
};

const mockSystemSettings = {
  openLinks: OpenPreference.FOREGROUND,
  keyboardShortcut: true,
  showNotificationsCountInTray: true,
  showNotifications: true,
  playSound: true,
  useAlternateIdleIcon: false,
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
