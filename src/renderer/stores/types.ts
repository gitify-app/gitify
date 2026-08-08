import type {
  Account,
  AccountUUID,
  FilterStateType,
  Forge,
  GitifyError,
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

// ============================================================================
// Notification Action Failures Store Types
// ============================================================================

/**
 * The notification action that most recently failed for a given notification.
 */
export type NotificationFailedActionType = 'markAsRead' | 'markAsDone' | 'unsubscribe';

/**
 * A recorded action failure for a single notification.
 */
export interface NotificationActionFailure {
  /**
   * The action that failed (used to know what to re-invoke on retry).
   */
  action: NotificationFailedActionType;

  /**
   * The classified error for the failure.
   */
  error: GitifyError;
}

/**
 * Ephemeral, session-local state tracking per-notification action failures.
 *
 * Not persisted and not part of the TanStack Query cache - a failed
 * mark-as-read/mark-as-done/unsubscribe action for a notification is
 * recorded here so `NotificationRow` can recolor/re-label that row's hover
 * actions, independent of the notification data itself.
 */
export interface NotificationActionFailuresState {
  /**
   * Map of notification ID to the details of its most recent failed action attempt.
   */
  failures: Record<string, NotificationActionFailure>;
}

/**
 * Actions for managing per-notification action failures.
 */
export interface NotificationActionFailuresActions {
  /**
   * Records a failed action for a notification.
   */
  setFailure: (notificationKey: string, failure: NotificationActionFailure) => void;

  /**
   * Clears a recorded failure for a notification (e.g. after a successful retry).
   */
  clearFailure: (notificationKey: string) => void;

  /**
   * Clears recorded failures for multiple notification keys.
   */
  clearFailures: (notificationKeys: string[]) => void;

  /**
   * Clears any recorded failures for notification IDs not present in `notificationIds`
   * (e.g. once a notification no longer appears in the notifications list).
   */
  pruneFailures: (notificationKeys: string[]) => void;

  /**
   * Resets the store to its default (empty) state.
   */
  reset: () => void;
}

/**
 * Complete notification action failures store type.
 */
export type NotificationActionFailuresStore = NotificationActionFailuresState &
  NotificationActionFailuresActions;
