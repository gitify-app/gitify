import { create } from 'zustand';

import type { ShortcutRegistrationStore } from './types';

import { DEFAULT_SETTINGS_STATE } from './defaults';

/**
 * Transient (non-persisted) state for global keyboard shortcut registration.
 *
 * Lives in the stores layer alongside the other client state; the
 * `useShortcutRegistration` effect hook reads it from the stores barrel.
 */
const useShortcutRegistrationStore = create<ShortcutRegistrationStore>()((set) => ({
  shortcutRegistrationError: null,
  lastAppliedShortcut: DEFAULT_SETTINGS_STATE.openGitifyShortcut,

  setShortcutRegistrationError: (error) => set({ shortcutRegistrationError: error }),
  setLastAppliedShortcut: (accelerator) => set({ lastAppliedShortcut: accelerator }),
  clearShortcutRegistrationError: () => set({ shortcutRegistrationError: null }),
  reset: () =>
    set({
      shortcutRegistrationError: null,
      lastAppliedShortcut: DEFAULT_SETTINGS_STATE.openGitifyShortcut,
    }),
}));

export default useShortcutRegistrationStore;
