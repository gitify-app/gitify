import {
  type AuthAccount,
  type AuthState,
  type SettingsState,
  Theme,
} from '../types';
import Constants from '../utils/constants';
import { mockedUser } from './mockedData';

export const mockPersonalAccessTokenAccount: AuthAccount = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456',
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockedUser,
};

export const mockOAuthAccount: AuthAccount = {
  platform: 'GitHub Enterprise Server',
  method: 'OAuth App',
  token: '1234568790',
  hostname: 'github.gitify.io',
  user: mockedUser,
};

export const mockGitHubCloudAccount: AuthAccount = {
  platform: 'GitHub Cloud',
  method: 'Personal Access Token',
  token: 'token-123-456',
  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
  user: mockedUser,
};

export const mockGitHubEnterpriseServerAccount: AuthAccount = {
  platform: 'GitHub Enterprise Server',
  method: 'Personal Access Token',
  token: '1234568790',
  hostname: 'github.gitify.io',
  user: mockedUser,
};

export const mockAccounts: AuthState = {
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
};
