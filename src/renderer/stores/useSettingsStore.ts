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
      (set) => ({
        ...DEFAULT_SETTINGS_STATE,

        updateSetting: (name, value) => {
          set({ [name]: value });
        },

        toggleSetting: (name) => {
          set((state) => {
            const current = state[name];

            if (typeof current !== 'boolean') {
              throw new Error(`toggleSetting: '${String(name)}' is not a boolean setting`);
            }

            return { [name]: !current };
          });
        },

        reset: () => {
          set({ ...DEFAULT_SETTINGS_STATE });
        },
      }),
      {
        name: Constants.STORAGE.SETTINGS,
        version: 1,
        migrate: (persisted) => {
          if (!persisted || typeof persisted !== 'object') {
            return DEFAULT_SETTINGS_STATE;
          }
          const { useAlternateIdleIcon, ...settings } = {
            useAlternateIdleIcon: undefined,
            ...persisted,
          };
          return {
            ...DEFAULT_SETTINGS_STATE,
            ...settings,
            trayIconAppearance:
              useAlternateIdleIcon === true
                ? 'light'
                : useAlternateIdleIcon === false && !window.gitify.platform.isMacOS()
                  ? 'dark'
                  : 'auto',
          };
        },
      },
    ),
  ),
);

export default useSettingsStore;
