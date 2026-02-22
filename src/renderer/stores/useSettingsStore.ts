import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

import { Constants } from '../constants';

import type { SettingsStore } from './types';

import { DEFAULT_SETTINGS_STATE } from './defaults';

/**
 * Gitify Settings store.
 *
 * Automatically persisted to local storage
 */
const useSettingsStore = create<SettingsStore>()(
  subscribeWithSelector(
    persist(
      (set, _get, store) => ({
        ...DEFAULT_SETTINGS_STATE,

        updateSetting: (name, value) => {
          set({ [name]: value });
        },

        toggleSetting: (name) => {
          set((state) => {
            const current = state[name];

            if (typeof current !== 'boolean') {
              throw new Error(
                `toggleSetting: '${String(name)}' is not a boolean setting`,
              );
            }

            return { [name]: !current };
          });
        },

        reset: () => {
          set(store.getInitialState());
        },
      }),
      {
        name: Constants.STORAGE.SETTINGS,
      },
    ),
  ),
);

export default useSettingsStore;
