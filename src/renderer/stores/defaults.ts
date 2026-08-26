import { Constants } from '../constants';

import {
  type AppearanceSettingsState,
  DesignLanguage,
  GroupBy,
  type KeyboardAcceleratorShortcut,
  type NotificationSettingsState,
  OpenPreference,
  type Percentage,
  type SettingsState,
  type SystemSettingsState,
  Theme,
  type TraySettingsState,
} from '../types';
import type { AccountsState, FiltersState } from './types';

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
  accounts: [],
  userTypes: [],
  subjectTypes: [],
  states: [],
  reasons: [],
  reviewRequestTypes: [],
};

/**
 * Default appearance settings
 */
const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettingsState = {
  designLanguage: DesignLanguage.CLASSIC,
  theme: Theme.SYSTEM,
  increaseContrast: false,
  showStatusIconColors: false,
  zoomPercentage: 100 as Percentage,
  showAccountHeader: false,
  wrapNotificationTitle: false,
};

/**
 * Default notification settings
 */
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsState = {
  groupBy: GroupBy.REPOSITORY,
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
  openGitifyShortcut: 'CommandOrControl+Shift+G' as KeyboardAcceleratorShortcut,
  showNotifications: true,
  playSound: true,
  notificationVolume: 20 as Percentage,
  openAtStartup: false,
  keepWindowOnBlur: false,
  showUpdateNotifications: true,
  useX11Backend: false,
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
