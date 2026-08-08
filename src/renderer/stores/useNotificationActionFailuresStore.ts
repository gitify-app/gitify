import { create } from 'zustand';

import type { Account } from '../types';
import type { NotificationActionFailuresStore } from './types';

import { getAccountUUID } from '../utils/auth/utils';

export function getNotificationFailureKey(account: Account, notificationId: string): string {
  return `${getAccountUUID(account)}:${notificationId}`;
}

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

  setFailure: (notificationKey, failure) => {
    set((state) => ({ failures: { ...state.failures, [notificationKey]: failure } }));
  },

  clearFailure: (notificationKey) => {
    const { failures } = get();
    if (!(notificationKey in failures)) {
      return;
    }

    const nextFailures = { ...failures };
    delete nextFailures[notificationKey];
    set({ failures: nextFailures });
  },

  clearFailures: (notificationKeys) => {
    const { failures } = get();
    const keysToClear = new Set(notificationKeys);
    const remainingEntries = Object.entries(failures).filter(
      ([notificationKey]) => !keysToClear.has(notificationKey),
    );

    if (remainingEntries.length === Object.keys(failures).length) {
      return;
    }

    set({ failures: Object.fromEntries(remainingEntries) });
  },

  pruneFailures: (notificationKeys) => {
    const { failures } = get();
    const keysToKeep = new Set(notificationKeys);

    const remainingEntries = Object.entries(failures).filter(([notificationKey]) =>
      keysToKeep.has(notificationKey),
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
