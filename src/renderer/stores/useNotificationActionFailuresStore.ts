import { create } from 'zustand';

import type { NotificationActionFailuresStore } from './types';

/**
 * Gitify Notification Action Failures store.
 *
 * Ephemeral, session-local state (not persisted, not part of the TanStack
 * Query cache) tracking which notifications had their most recent
 * mark-as-read/mark-as-done/unsubscribe action fail, and with what
 * classified error. Cleared on successful retry or when a notification no
 * longer appears in the notifications list.
 */
const useNotificationActionFailuresStore = create<NotificationActionFailuresStore>((set, get) => ({
  failures: {},

  setFailure: (notificationId, failure) => {
    set((state) => ({ failures: { ...state.failures, [notificationId]: failure } }));
  },

  clearFailure: (notificationId) => {
    const { failures } = get();
    if (!(notificationId in failures)) {
      return;
    }

    const nextFailures = { ...failures };
    delete nextFailures[notificationId];
    set({ failures: nextFailures });
  },

  pruneFailures: (notificationIds) => {
    const { failures } = get();
    const idsToKeep = new Set(notificationIds);

    const remainingEntries = Object.entries(failures).filter(([notificationId]) =>
      idsToKeep.has(notificationId),
    );

    if (remainingEntries.length === Object.keys(failures).length) {
      return;
    }

    set({ failures: Object.fromEntries(remainingEntries) });
  },

  reset: () => {
    set({ failures: {} });
  },
}));

export default useNotificationActionFailuresStore;
