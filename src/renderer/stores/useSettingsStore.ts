import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

import { Constants } from '../constants';

import type { SettingsStore } from './types';

import { DEFAULT_SETTINGS_STATE } from './defaults';

/**
 * Gitify Settings store.
 *
 * Automatically persisted to local storage.
 */
const useSettingsStore = create<SettingsStore>()(
  persist(
    subscribeWithSelector((set, _get, store) => ({
      ...DEFAULT_SETTINGS_STATE,

      updateSetting: (name, value) => {
        set({ [name]: value } as Partial<SettingsStore>);
      },

      toggleSetting: (name) => {
        set((state) => ({ [name]: !state[name] } as Partial<SettingsStore>));
      },

      resetSettings: () => {
        set(store.getInitialState());
      },
    })),
    {
      name: Constants.SETTINGS_STORE_KEY,
    },
  ),
);

export default useSettingsStore;
