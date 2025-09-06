import {
  type AppearanceSettingsState,
  type AuthState,
  type FilterSettingsState,
  GroupBy,
  type NotificationSettingsState,
  OpenPreference,
  type SettingsState,
  type SystemSettingsState,
  Theme,
} from '../types';

export const defaultAuth: AuthState = {
  accounts: [],
};

const defaultAppearanceSettings: AppearanceSettingsState = {
  theme: Theme.SYSTEM,
  increaseContrast: false,
  zoomPercentage: 100,
  showAccountHeader: false,
  wrapNotificationTitle: false,
};

const defaultNotificationSettings: NotificationSettingsState = {
  groupBy: GroupBy.REPOSITORY,
  fetchAllNotifications: true,
  detailedNotifications: true,
  showPills: true,
  showNumber: true,
  participating: false,
  markAsDoneOnOpen: false,
  markAsDoneOnUnsubscribe: false,
  delayNotificationState: false,
};

const defaultSystemSettings: SystemSettingsState = {
  openLinks: OpenPreference.FOREGROUND,
  keyboardShortcut: true,
  showNotificationsCountInTray: true,
  showNotifications: true,
  playSound: true,
  notificationVolume: 20,
  useAlternateIdleIcon: false,
  openAtStartup: false,
};

export const defaultFilters: FilterSettingsState = {
  filterUserTypes: [],
  filterIncludeSearchTokens: [],
  filterExcludeSearchTokens: [],
  filterSubjectTypes: [],
  filterStates: [],
  filterReasons: [],
};

export const defaultSettings: SettingsState = {
  ...defaultAppearanceSettings,
  ...defaultNotificationSettings,
  ...defaultSystemSettings,
  ...defaultFilters,
};
