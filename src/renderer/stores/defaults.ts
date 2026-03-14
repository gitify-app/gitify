import { Constants } from '../constants';

import {
  FetchType,
  GroupBy,
  OpenPreference,
  type Percentage,
  type SettingsState,
  Theme,
} from '../types';
import type { AccountsState, FiltersState, RuntimeState } from './types';

/**
 * Default accounts state
 */
export const DEFAULT_ACCOUNTS_STATE: AccountsState = {
  accounts: [],
};

/**
 * Default settings state
 */
export const DEFAULT_SETTINGS_STATE: SettingsState = {
  // Appearance
  theme: Theme.SYSTEM,
  increaseContrast: false,
  zoomPercentage: 100 as Percentage,
  showAccountHeader: false,
  wrapNotificationTitle: false,

  // Notifications
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

  // Tray
  showNotificationsCountInTray: true,
  useUnreadActiveIcon: true,
  useAlternateIdleIcon: false,

  // System
  openLinks: OpenPreference.FOREGROUND,
  keyboardShortcut: true,
  showNotifications: true,
  playSound: true,
  notificationVolume: 20 as Percentage,
  openAtStartup: false,
};

/**
 * Default runtime state
 */
export const DEFAULT_RUNTIME_STATE: RuntimeState = {
  notificationCount: 0,
  isError: false,
  isOnline: true,
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
