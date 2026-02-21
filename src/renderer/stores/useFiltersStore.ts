import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Constants } from '../constants';

import type { FiltersStore } from './types';

import { DEFAULT_FILTERS_STATE } from './defaults';

/**
 * Atlassify Filters store.
 *
 * Automatically persisted to local storage
 */
const useFiltersStore = create<FiltersStore>()(
  persist(
    (set, get, store) => ({
      ...DEFAULT_FILTERS_STATE,

      hasActiveFilters: () => {
        const state = get();
        return (
          state.includeSearchTokens.length > 0 ||
          state.excludeSearchTokens.length > 0 ||
          state.userTypes.length > 0 ||
          state.subjectTypes.length > 0 ||
          state.states.length > 0 ||
          state.reasons.length > 0
        );
      },

      updateFilter: (key, value, checked) => {
        set((state) => {
          const current = state[key];

          if (checked) {
            return {
              [key]: [...current, value],
            };
          }

          return { [key]: current.filter((item) => item !== value) };
        });
      },

      reset: () => {
        set(store.getInitialState());
      },
    }),
    {
      name: Constants.FILTERS_STORE_KEY,
    },
  ),
);

export default useFiltersStore;
