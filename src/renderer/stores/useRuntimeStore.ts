import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { RuntimeStore } from './types';

import { DEFAULT_RUNTIME_STATE } from './defaults';

/**
 * Gitify Runtime store.
 *
 * Not persisted — holds transient tray/bridge state.
 */
const useRuntimeStore = create<RuntimeStore>()(
  subscribeWithSelector((set) => ({
    ...DEFAULT_RUNTIME_STATE,

    updateNotificationStatus: (count: number, isError: boolean) => {
      set({ notificationCount: count, isError });
    },
  })),
);

export default useRuntimeStore;
