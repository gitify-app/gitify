import type {
  Account,
  Hostname,
  Percentage,
  Reason,
  SearchToken,
  SubjectType,
  Token,
  UserType,
} from '../types';
import type { AuthMethod } from '../utils/auth/types';

/**
 * System preference for opening web resources / links.
 */
export enum OpenPreference {
  FOREGROUND = 'FOREGROUND',
  BACKGROUND = 'BACKGROUND',
}

export enum Theme {
  SYSTEM = 'SYSTEM',
  LIGHT = 'LIGHT',
  LIGHT_COLORBLIND = 'LIGHT_COLORBLIND',
  LIGHT_TRITANOPIA = 'LIGHT_TRITANOPIA',
  DARK = 'DARK',
  DARK_COLORBLIND = 'DARK_COLORBLIND',
  DARK_TRITANOPIA = 'DARK_TRITANOPIA',
  DARK_DIMMED = 'DARK_DIMMED',
}

export enum GroupBy {
  REPOSITORY = 'REPOSITORY',
  DATE = 'DATE',
}

export enum FetchType {
  INTERVAL = 'INTERVAL',
  INACTIVITY = 'INACTIVITY',
}

/**
 * The authenticated accounts state.
 */
export interface AccountsState {
  accounts: Account[];
}

// ============================================================================
// Accounts Store Types
// ============================================================================

/**
 * Actions for managing accounts.
 */
export interface AccountsActions {
  addAccount: (account: Account) => void;
  createAccount: (
    method: AuthMethod,
    token: Token,
    hostname: Hostname,
  ) => Promise<void>;
  refreshAccount: (account: Account) => Promise<Account>;
  removeAccount: (account: Account) => void;
  hasAccounts: () => boolean;
  hasMultipleAccounts: () => boolean;
  isLoggedIn: () => boolean;
  primaryAccountHostname: () => Hostname;
  reset: () => void;
}

/**
 * Complete accounts store type.
 */
export type AccountsStore = AccountsState & AccountsActions;

// ============================================================================
// Filters Store Types
// ============================================================================

export type FilterStateType = 'open' | 'closed' | 'merged' | 'draft' | 'other';

/**
 * Settings related to the filtering of notifications within the application.
 */
export interface FiltersState {
  /**
   * The search tokens to include notifications by.
   */
  includeSearchTokens: SearchToken[];

  /**
   * The search tokens to exclude notifications by.
   */
  excludeSearchTokens: SearchToken[];

  /**
   * The user types to filter notifications by.
   */
  userTypes: UserType[];

  /**
   * The subject types to filter notifications by.
   */
  subjectTypes: SubjectType[];

  /**
   * The states to filter notifications by.
   */
  states: FilterStateType[];

  /**
   * The reasons to filter notifications by.
   */
  reasons: Reason[];
}

/**
 * All allowed Filter types.
 * Automatically derived from the FiltersState.
 */
export type FilterKey = keyof FiltersState;

/**
 * Type-safe update function for filters.
 */
export type UpdateFilter = <K extends FilterKey>(
  key: K,
  value: FiltersState[K][number],
  checked: boolean,
) => void;

/**
 * Actions for managing filters.
 */
export interface FiltersActions {
  hasActiveFilters: () => boolean;
  updateFilter: UpdateFilter;
  reset: () => void;
}

/**
 * Complete filters store type.
 */
export type FiltersStore = FiltersState & FiltersActions;

// ============================================================================
// Settings Store Types
// ============================================================================

/**
 * Settings related to the appearance of the application.
 */
export interface AppearanceSettingsState {
  /**
   * The theme of the application.
   */
  theme: Theme;

  increaseContrast: boolean;

  /**
   * The zoom percentage of the application.
   */
  zoomPercentage: Percentage;

  /**
   * Show account header
   */
  showAccountHeader: boolean;

  wrapNotificationTitle: boolean;
}

/**
 * Settings related to the notifications within the application.
 */
export interface NotificationSettingsState {
  /**
   * How to group notifications within the application.
   */
  groupBy: GroupBy;

  /**
   * The amount of time (in milliseconds) between each fetch of new notifications.
   */
  fetchInterval: number;

  /**
   * Whether to fetch all notifications or only unread notifications.
   */
  fetchAllNotifications: boolean;

  /**
   * Whether to show detailed notifications.
   * TODO - Deprecate in v7?
   */
  detailedNotifications: boolean;

  /**
   * Whether to show metric pills on notifications.
   */
  showPills: boolean;

  /**
   * Whether to show issue/pr/discussion numbers on notifications.
   * TODO - Deprecate in v7?
   */
  showNumber: boolean;

  /**
   * Whether to fetch only participating notifications.
   */
  participating: boolean;

  /**
   * Whether to fetch read and unread notifications, or all notifications.
   */
  fetchReadNotifications: boolean;

  /**
   * Whether to mark notifications as done when they are opened.
   */
  markAsDoneOnOpen: boolean;

  /**
   * Whether to mark notifications as done when they are unsubscribed.
   */
  markAsDoneOnUnsubscribe: boolean;

  /**
   * Whether to delay the notification state changes upon interactions.
   */
  delayNotificationState: boolean;
}

/**
 * Settings related to the tray / menu bar behavior.
 */
export interface TraySettingsState {
  /**
   * Whether to show the notifications count in the tray icon.
   */
  showNotificationsCountInTray: boolean;

  /**
   * Whether to use the active green icon for highlighting unread notifications.
   */
  useUnreadActiveIcon: boolean;

  /**
   * Whether to use the alternate white idle icon, suitable for devices which have dark-themed system bars.
   */
  useAlternateIdleIcon: boolean;
}

/**
 * Settings related to the system behavior of the application.
 */
export interface SystemSettingsState {
  /**
   * The preference for opening links upon notification interactions.
   */
  openLinks: OpenPreference;

  /**
   * Whether to enable the keyboard shortcuts for the application.
   */
  keyboardShortcut: boolean;

  /**
   * Whether to show/raise system notifications.
   */
  showNotifications: boolean;

  /**
   * Whether to play a sound for new notifications.
   */
  playSound: boolean;

  /**
   * The volume for the notification sound.
   */
  notificationVolume: Percentage;

  /**
   * Whether to open the application on system startup.
   */
  openAtStartup: boolean;
}

/**
 * All Settings combined.
 */
export type SettingsState = AppearanceSettingsState &
  NotificationSettingsState &
  TraySettingsState &
  SystemSettingsState;

/**
 * Actions for managing settings.
 */
export interface SettingsActions {
  updateSetting: <K extends keyof SettingsState>(
    name: K,
    value: SettingsState[K],
  ) => void;
  reset: () => void;
}

/**
 * Complete settings store type.
 */
export type SettingsStore = SettingsState & SettingsActions;
