import { create } from 'zustand';

import type { NotificationFocusStore } from './types';

let nextRequestId = 0;

/**
 * Transient, session-only intent to reveal a notification in the list.
 *
 * The native-notification click path requests a focus; the list consumes it
 * after navigating to the notifications route. Kept outside the query cache and
 * not persisted, because it describes one transient interaction.
 */
const useNotificationFocusStore = create<NotificationFocusStore>()((set) => ({
  intent: null,

  requestFocus: (accountUUID, notificationId) => {
    nextRequestId += 1;
    set({
      intent: {
        accountUUID,
        notificationId,
        requestId: nextRequestId,
      },
    });
  },

  clearFocus: (requestId) => {
    set((state) => (state.intent?.requestId === requestId ? { intent: null } : {}));
  },

  reset: () => {
    set({ intent: null });
  },
}));

export default useNotificationFocusStore;
