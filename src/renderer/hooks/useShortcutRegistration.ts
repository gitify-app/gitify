import { useEffect } from 'react';

import { create } from 'zustand';

import { DEFAULT_SETTINGS_STATE, useSettingsStore } from '../stores';

import type { KeyboardAcceleratorShortcut } from '../types';

import { applyKeyboardShortcut } from '../utils/system/comms';

interface ShortcutRegistrationStore {
  /**
   * User-facing error when the configured global shortcut could not be
   * registered (e.g. already in use by another application).
   */
  shortcutRegistrationError: string | null;

  /**
   * The last accelerator that registered successfully; used to revert the
   * setting when a newly chosen accelerator fails to register.
   */
  lastAppliedShortcut: KeyboardAcceleratorShortcut;

  setShortcutRegistrationError: (error: string | null) => void;
  setLastAppliedShortcut: (accelerator: KeyboardAcceleratorShortcut) => void;
  clearShortcutRegistrationError: () => void;
  reset: () => void;
}

/**
 * Transient (non-persisted) state for global keyboard shortcut registration.
 */
export const useShortcutRegistrationStore = create<ShortcutRegistrationStore>()((set) => ({
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

/**
 * Registers the global open/close shortcut whenever the setting changes,
 * reverting to the last working accelerator when registration fails.
 *
 * Mount once at the app level (GlobalEffects).
 */
export function useShortcutRegistration(): void {
  const keyboardShortcut = useSettingsStore((s) => s.keyboardShortcut);
  const openGitifyShortcut = useSettingsStore((s) => s.openGitifyShortcut);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await applyKeyboardShortcut({
        enabled: keyboardShortcut,
        accelerator: openGitifyShortcut,
      });

      if (cancelled) {
        return;
      }

      const { lastAppliedShortcut, setLastAppliedShortcut, setShortcutRegistrationError } =
        useShortcutRegistrationStore.getState();

      if (!result.success) {
        updateSetting('openGitifyShortcut', lastAppliedShortcut);
        setShortcutRegistrationError(
          'This shortcut could not be registered. It may already be in use.',
        );
        return;
      }

      setLastAppliedShortcut(openGitifyShortcut);
      setShortcutRegistrationError(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [keyboardShortcut, openGitifyShortcut, updateSetting]);
}
