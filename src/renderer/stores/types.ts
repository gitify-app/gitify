import type {
  FilterStateType,
  Reason,
  SearchToken,
  SubjectType,
  UserType,
} from '../types';

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
