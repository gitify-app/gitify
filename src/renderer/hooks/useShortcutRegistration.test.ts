import { renderHook, waitFor } from '@testing-library/react';

import { DEFAULT_SETTINGS_STATE, useSettingsStore } from '../stores';

import type { KeyboardAcceleratorShortcut } from '../types';

import { useShortcutRegistration, useShortcutRegistrationStore } from './useShortcutRegistration';

describe('renderer/hooks/useShortcutRegistration.ts', () => {
  it('registers the configured shortcut and records it as last applied', async () => {
    useSettingsStore.setState({
      openGitifyShortcut: 'CommandOrControl+Shift+X' as KeyboardAcceleratorShortcut,
    });

    renderHook(() => useShortcutRegistration());

    await waitFor(() => {
      expect(useShortcutRegistrationStore.getState().lastAppliedShortcut).toBe(
        'CommandOrControl+Shift+X',
      );
    });

    expect(window.gitify.applyKeyboardShortcut).toHaveBeenCalledWith({
      enabled: true,
      keyboardShortcut: 'CommandOrControl+Shift+X',
    });
    expect(useShortcutRegistrationStore.getState().shortcutRegistrationError).toBeNull();
  });

  it('reverts the setting and surfaces an error when registration fails', async () => {
    vi.mocked(window.gitify.applyKeyboardShortcut).mockResolvedValue({ success: false });

    useSettingsStore.setState({
      openGitifyShortcut: 'CommandOrControl+Shift+X' as KeyboardAcceleratorShortcut,
    });

    renderHook(() => useShortcutRegistration());

    await waitFor(() => {
      expect(useShortcutRegistrationStore.getState().shortcutRegistrationError).toBe(
        'This shortcut could not be registered. It may already be in use.',
      );
    });

    // The setting reverts to the last successfully applied accelerator
    expect(useSettingsStore.getState().openGitifyShortcut).toBe(
      DEFAULT_SETTINGS_STATE.openGitifyShortcut,
    );
  });
});
