import { type FC, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useAccounts } from '../hooks/useAccounts';
import { useAppearance } from '../hooks/useAppearance';
import { useNotifications } from '../hooks/useNotifications';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  useShortcutRegistration,
  useShortcutRegistrationStore,
} from '../hooks/useShortcutRegistration';
import { useAccountsStore, useFiltersStore, useSettingsStore } from '../stores';

import { setTrayIconColorAndTitle } from '../utils/system/tray';

/**
 * Hosts all app-level side effects. Mount exactly once, inside the Primer
 * ThemeProvider and the QueryClientProvider. Renders nothing.
 *
 * Owns: theme application, tray icon updates, global shortcut registration,
 * app reset handling, periodic account refreshes, and notification alerts.
 */
export const GlobalEffects: FC = () => {
  const queryClient = useQueryClient();

  const resetAccounts = useAccountsStore((s) => s.reset);
  const resetFilters = useFiltersStore((s) => s.reset);
  const resetSettings = useSettingsStore((s) => s.reset);

  // Subscribe to tray-related settings for useEffect dependencies
  const showNotificationsCountInTray = useSettingsStore((s) => s.showNotificationsCountInTray);
  const useUnreadActiveIcon = useSettingsStore((s) => s.useUnreadActiveIcon);
  const useAlternateIdleIcon = useSettingsStore((s) => s.useAlternateIdleIcon);

  const isOnline = useOnlineStatus();

  // Appearance side effects: color mode/scheme + design-language/material attributes
  useAppearance();

  // Notification fetching side effects (sound / native alerts, inactivity refetch)
  const { status, notificationCount } = useNotifications({ withSideEffects: true });

  // Periodic account refreshes (startup + hourly interval)
  useAccounts();

  // Global keyboard shortcut registration, reverting on failure
  useShortcutRegistration();

  // oxlint-disable-next-line react/exhaustive-deps -- We want to update the tray on setting or notification changes
  useEffect(() => {
    const trayCount = status === 'error' ? -1 : notificationCount;
    setTrayIconColorAndTitle(trayCount, isOnline);
  }, [
    showNotificationsCountInTray,
    useUnreadActiveIcon,
    useAlternateIdleIcon,
    status,
    notificationCount,
    isOnline,
  ]);

  useEffect(() => {
    return window.gitify.onResetApp(() => {
      resetAccounts();
      resetSettings();
      resetFilters();
      queryClient.clear();
      useShortcutRegistrationStore.getState().reset();
    });
  }, [resetAccounts, resetSettings, resetFilters, queryClient]);

  return null;
};
