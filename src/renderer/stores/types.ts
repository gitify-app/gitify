import type {
  Account,
  FilterStateType,
  Hostname,
  Reason,
  SearchToken,
  SettingsState,
  SettingsValue,
  SubjectType,
  Token,
  UserType,
} from '../types';
import type {
  DeviceFlowSession,
  LoginOAuthWebOptions,
  LoginPersonalAccessTokenOptions,
} from '../utils/auth/types';

// ============================================================================
// Filters Store Types
// ============================================================================

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
// Accounts Store Types
// ============================================================================

export interface AccountsState {
  accounts: Account[];
}

export interface AccountsActions {
  isLoggedIn: () => boolean;

  loginWithDeviceFlowStart: (
    hostname?: Hostname,
  ) => Promise<DeviceFlowSession>;
  loginWithDeviceFlowPoll: (
    session: DeviceFlowSession,
  ) => Promise<Token | null>;
  loginWithDeviceFlowComplete: (
    token: Token,
    hostname: Hostname,
  ) => Promise<void>;
  loginWithOAuthApp: (data: LoginOAuthWebOptions) => Promise<void>;
  loginWithPersonalAccessToken: (
    data: LoginPersonalAccessTokenOptions,
  ) => Promise<void>;
  logoutFromAccount: (account: Account) => void;

  reset: () => void;
}

export type AccountsStore = AccountsState & AccountsActions;

// ============================================================================
// Settings Store Types
// ============================================================================

export interface SettingsActions {
  updateSetting: (name: keyof SettingsState, value: SettingsValue) => void;
  toggleSetting: (name: keyof SettingsState) => void;
  resetSettings: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

// ============================================================================
// Runtime Store Types
// ============================================================================

export interface RuntimeState {
  notificationCount: number;
  isError: boolean;
  isOnline: boolean;
}

export interface RuntimeActions {
  updateNotificationStatus: (count: number, isError: boolean) => void;
}

export type RuntimeStore = RuntimeState & RuntimeActions;
