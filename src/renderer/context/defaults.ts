import { Constants } from '../constants';
import {
  type AppearanceSettingsState,
  type AuthState,
  type ConfigSettingsState,
  FetchType,
  type FilterSettingsState,
  GroupBy,
  type NotificationSettingsState,
  OpenPreference,
  type Percentage,
  type SettingsState,
  type SystemSettingsState,
  Theme,
  type TraySettingsState,
} from '../types';

export const defaultAuth: AuthState = {
  accounts: [],
};

const defaultAppearanceSettings: AppearanceSettingsState = {
  theme: Theme.SYSTEM,
  increaseContrast: false,
  zoomPercentage: 100 as Percentage,
  showAccountHeader: false,
  wrapNotificationTitle: false,
};

const defaultNotificationSettings: NotificationSettingsState = {
  groupBy: GroupBy.REPOSITORY,
  fetchType: FetchType.INTERVAL,
  fetchInterval: Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
  fetchAllNotifications: true,
  detailedNotifications: true,
  showPills: true,
  showNumber: true,
  participating: false,
  fetchReadNotifications: false,
  markAsDoneOnOpen: false,
  markAsDoneOnUnsubscribe: false,
  delayNotificationState: false,
};

const defaultTraySettings: TraySettingsState = {
  showNotificationsCountInTray: true,
  useUnreadActiveIcon: true,
  useAlternateIdleIcon: false,
};

const defaultSystemSettings: SystemSettingsState = {
  openLinks: OpenPreference.FOREGROUND,
  keyboardShortcut: true,
  showNotifications: true,
  playSound: true,
  notificationVolume: 20 as Percentage,
  openAtStartup: false,
};

export const defaultFilterSettings: FilterSettingsState = {
  filterUserTypes: [],
  filterIncludeSearchTokens: [],
  filterExcludeSearchTokens: [],
  filterSubjectTypes: [],
  filterStates: [],
  filterReasons: [],
};

export const defaultConfigSettings: ConfigSettingsState = {
  ...defaultAppearanceSettings,
  ...defaultNotificationSettings,
  ...defaultTraySettings,
  ...defaultSystemSettings,
};

export const defaultSettings: SettingsState = {
  ...defaultConfigSettings,
  ...defaultFilterSettings,
};
