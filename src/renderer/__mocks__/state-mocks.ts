import { Constants } from '../constants';
import {
  type AppearanceSettingsState,
  type AuthState,
  FetchType,
  type FilterSettingsState,
  type GitifyState,
  GroupBy,
  type NotificationSettingsState,
  OpenPreference,
  type Percentage,
  type SettingsState,
  type SystemSettingsState,
  Theme,
  type Token,
  type TraySettingsState,
} from '../types';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from './account-mocks';

export const mockAuth: AuthState = {
  accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
};

export const mockToken = 'token-123-456' as Token;

const mockAppearanceSettings: AppearanceSettingsState = {
  theme: Theme.SYSTEM,
  increaseContrast: false,
  zoomPercentage: 100 as Percentage,
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
  showReadNotifications: true,
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
  notificationVolume: 20 as Percentage,
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
