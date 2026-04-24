import { DEFAULT_SOUND_ID } from '../../shared/sounds';

import { Constants } from '../constants';

import {
  type AppearanceSettingsState,
  type AuthState,
  FetchType,
  GroupBy,
  type KeyboardAcceleratorShortcut,
  type NotificationSettingsState,
  OpenPreference,
  type Percentage,
  type ReasonSoundMap,
  type SettingsState,
  type SystemSettingsState,
  Theme,
  type TraySettingsState,
} from '../types';

const defaultReasonSounds: ReasonSoundMap = {
  assign: 'youre-the-last-one',
  review_requested: 'youre-the-last-one',
  review_approved: 'approved',
  review_changes_requested: 'changes-requested',
  pr_merged_assigned: 'tuturu',
};

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
  openGitifyShortcut: 'CommandOrControl+Shift+G' as KeyboardAcceleratorShortcut,
  showNotifications: true,
  playSound: true,
  notificationVolume: 20 as Percentage,
  openAtStartup: false,
  defaultSound: DEFAULT_SOUND_ID,
  reasonSounds: defaultReasonSounds,
};

export const defaultSettings: SettingsState = {
  ...defaultAppearanceSettings,
  ...defaultNotificationSettings,
  ...defaultTraySettings,
  ...defaultSystemSettings,
};
