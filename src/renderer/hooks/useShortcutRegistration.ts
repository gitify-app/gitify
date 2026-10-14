import { useEffect } from 'react';

import { useSettingsStore, useShortcutRegistrationStore } from '../stores';

import { applyKeyboardShortcut } from '../utils/system/comms';

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
