import type { FiltersState } from './types';

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
