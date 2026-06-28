import type { FiltersState } from './types';

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
