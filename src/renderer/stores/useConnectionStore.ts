import { create } from 'zustand';

import type { ConnectionStore } from './types';

/**
 * Session-local connection lifecycle.
 *
 * Not persisted: a fresh process starts online and the first network event or
 * notification fetch corrects it. Polling code reads `state` via `getState()`
 * to decide whether a short recovery retry applies.
 */
const useConnectionStore = create<ConnectionStore>()((set, get) => ({
  state: 'online',
  recoveringSince: null,
  baselineDataUpdatedAt: 0,

  setOffline: () => {
    set({ state: 'offline', recoveringSince: null, baselineDataUpdatedAt: 0 });
  },

  startRecovery: (baselineDataUpdatedAt) => {
    if (get().state === 'recovering') {
      return;
    }

    set({
      state: 'recovering',
      recoveringSince: Date.now(),
      baselineDataUpdatedAt,
    });
  },

  settle: () => {
    set({ state: 'online', recoveringSince: null, baselineDataUpdatedAt: 0 });
  },
}));

export default useConnectionStore;
