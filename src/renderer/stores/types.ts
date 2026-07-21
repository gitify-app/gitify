import type {
  Account,
  AccountUUID,
  FilterStateType,
  Forge,
  Hostname,
  Reason,
  ReviewRequestType,
  SearchToken,
  SettingsState,
  SubjectType,
  Token,
  UserType,
} from '../types';
import type { AuthMethod } from '../utils/auth/types';

// ============================================================================
// Accounts Store Types
// ============================================================================

/**
 * The authenticated accounts state.
 */
export interface AccountsState {
  accounts: Account[];
}

/**
 * Actions for managing accounts.
 */
export interface AccountsActions {
  /**
   * Creates a new account, or updates it if it already exists (re-authentication).
   */
  createAccount: (
    method: AuthMethod,
    token: Token,
    hostname: Hostname,
    forge?: Forge,
    username?: string,
  ) => Promise<void>;

  /**
   * Refreshes the user details for an account.
   */
  refreshAccount: (account: Account) => Promise<Account>;

  /**
   * Removes an account.
   */
  removeAccount: (account: Account) => void;

  /**
   * Persists account tokens re-encrypted after the OS keychain rotated keys.
   *
   * Tokens are expected to already be encrypted at rest; plaintext tokens from
   * pre-encryption releases are no longer migrated and require re-authentication.
   */
  persistRotatedAccountTokens: () => Promise<void>;

  /**
   * Checks if the user is logged in (has at least one account).
   */
  isLoggedIn: () => boolean;

  /**
   * Checks if there are multiple accounts.
   */
  hasMultipleAccounts: () => boolean;

  /**
   * Gets the primary account's hostname (first account).
   */
  primaryAccountHostname: () => Hostname;

  /**
   * Resets accounts to default state.
   */
  reset: () => void;
}

/**
 * Complete accounts store type.
 */
export type AccountsStore = AccountsState & AccountsActions;

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
   * The account UUIDs to filter notifications by.
   * When empty, all accounts are shown.
   */
  accounts: AccountUUID[];

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

  /**
   * The review request types to filter notifications by.
   */
  reviewRequestTypes: ReviewRequestType[];
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
 * Actions for managing settings.
 */
export interface SettingsActions {
  /**
   * Updates a specific setting by key to a new value.
   *
   * @param name The setting key to update.
   * @param value The new value for the setting.
   */
  updateSetting: <K extends keyof SettingsState>(name: K, value: SettingsState[K]) => void;

  /**
   * Toggles a boolean setting by key. Throws if the setting is not boolean.
   *
   * @param name The setting key to toggle.
   */
  toggleSetting: <K extends keyof SettingsState>(name: K) => void;

  /**
   * Resets all settings to their default values.
   */
  reset: () => void;
}

/**
 * Complete settings store type.
 */
export type SettingsStore = SettingsState & SettingsActions;
