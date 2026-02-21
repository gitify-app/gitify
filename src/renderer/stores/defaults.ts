import { Constants } from '../constants';

import type { Percentage } from '../types';
import {
  type AccountsState,
  type AppearanceSettingsState,
  FetchType,
  type FiltersState,
  GroupBy,
  type NotificationSettingsState,
  OpenPreference,
  type SettingsState,
  type SystemSettingsState,
  Theme,
  type TraySettingsState,
} from './types';

/**
 * Default accounts state
 */
export const DEFAULT_ACCOUNTS_STATE: AccountsState = {
  accounts: [],
};

/**
 * Default filters state
 */
export const DEFAULT_FILTERS_STATE: FiltersState = {
  includeSearchTokens: [],
  excludeSearchTokens: [],
  userTypes: [],
  subjectTypes: [],
  states: [],
  reasons: [],
};

/**
 * Default appearance settings
 */
const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettingsState = {
  theme: Theme.SYSTEM,
  increaseContrast: false,
  zoomPercentage: 100 as Percentage,
  showAccountHeader: false,
  wrapNotificationTitle: false,
};

/**
 * Default notification settings
 */
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsState = {
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

/**
 * Default tray settings
 */
const DEFAULT_TRAY_SETTINGS: TraySettingsState = {
  showNotificationsCountInTray: true,
  useUnreadActiveIcon: true,
  useAlternateIdleIcon: false,
};

/**
 * Default system settings
 */
const DEFAULT_SYSTEM_SETTINGS: SystemSettingsState = {
  openLinks: OpenPreference.FOREGROUND,
  keyboardShortcut: true,
  showNotifications: true,
  playSound: true,
  notificationVolume: 20 as Percentage,
  openAtStartup: false,
};

/**
 * Default settings state (combined)
 */
export const DEFAULT_SETTINGS_STATE: SettingsState = {
  ...DEFAULT_APPEARANCE_SETTINGS,
  ...DEFAULT_NOTIFICATION_SETTINGS,
  ...DEFAULT_TRAY_SETTINGS,
  ...DEFAULT_SYSTEM_SETTINGS,
};
