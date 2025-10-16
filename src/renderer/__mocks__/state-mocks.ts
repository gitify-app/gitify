import { Constants } from '../constants';
import {
  type Account,
  type AppearanceSettingsState,
  type AuthState,
  FetchType,
  type FilterSettingsState,
  type GitifyState,
  type GitifyUser,
  GroupBy,
  type Hostname,
  type Link,
  type NotificationSettingsState,
  OpenPreference,
  type SettingsState,
  type SystemSettingsState,
  Theme,
  type Token,
  type TraySettingsState,
} from '../types';

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

const mockAppearanceSettings: AppearanceSettingsState = {
  theme: Theme.SYSTEM,
  increaseContrast: false,
  zoomPercentage: 100,
  showAccountHeader: false,
  wrapNotificationTitle: false,
};

const mockNotificationSettings: NotificationSettingsState = {
  groupBy: GroupBy.REPOSITORY,
  fetchType: FetchType.INTERVAL,
  fetchInterval: Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
  fetchAllNotifications: true,
  detailedNotifications: true,
  showPills: true,
  showNumber: true,
  participating: false,
  markAsDoneOnOpen: false,
  markAsDoneOnUnsubscribe: false,
  delayNotificationState: false,
};

const mockTraySettings: TraySettingsState = {
  showNotificationsCountInTray: true,
  useUnreadActiveIcon: true,
  useAlternateIdleIcon: false,
};

const mockSystemSettings: SystemSettingsState = {
  openLinks: OpenPreference.FOREGROUND,
  keyboardShortcut: true,
  showNotifications: true,
  playSound: true,
  notificationVolume: 20,
  openAtStartup: false,
};

const mockFilters: FilterSettingsState = {
  filterUserTypes: [],
  filterIncludeSearchTokens: [],
  filterExcludeSearchTokens: [],
  filterSubjectTypes: [],
  filterStates: [],
  filterReasons: [],
};

export const mockSettings: SettingsState = {
  ...mockAppearanceSettings,
  ...mockNotificationSettings,
  ...mockTraySettings,
  ...mockSystemSettings,
  ...mockFilters,
};

export const mockState: GitifyState = {
  auth: mockAuth,
  settings: mockSettings,
};
