import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useNotificationsHost } from '../hooks/notifications/useNotificationsHost';
import { useAccounts } from '../hooks/useAccounts';
import { useAppearance } from '../hooks/useAppearance';
import { useConnectionRecovery } from '../hooks/useConnectionRecovery';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePowerState } from '../hooks/usePowerState';
import { useShortcutRegistration } from '../hooks/useShortcutRegistration';
import {
  useAccountsStore,
  useConnectionStore,
  useFiltersStore,
  useSettingsStore,
  useShortcutRegistrationStore,
} from '../stores';

import { setTrayIconColorAndTitle } from '../utils/system/tray';

/**
 * Hosts all app-level side effects. Mount exactly once, inside the Primer
 * ThemeProvider and the QueryClientProvider. Renders nothing.
 *
 * Owns: theme application, tray icon updates, global shortcut registration,
 * app reset handling, periodic account refreshes, and notification alerts.
 */
export function GlobalEffects() {
  const queryClient = useQueryClient();

  const resetAccounts = useAccountsStore((s) => s.reset);
  const resetFilters = useFiltersStore((s) => s.reset);
  const resetSettings = useSettingsStore((s) => s.reset);

  // Subscribe to tray-related settings for useEffect dependencies
  const showNotificationsCountInTray = useSettingsStore((s) => s.showNotificationsCountInTray);
  const useUnreadActiveIcon = useSettingsStore((s) => s.useUnreadActiveIcon);
  const trayIconAppearance = useSettingsStore((s) => s.trayIconAppearance);

  const isNetworkOnline = useOnlineStatus();

  // Appearance side effects: color mode/scheme + design-language/material attributes
  useAppearance();

  // Notification fetching side effects (sound / native alerts, interval/focus/reconnect
  // polling, and the system-wake refetch)
  const { status, notificationCount, notifications, isFetching, isPaused, isError, dataUpdatedAt } =
    useNotificationsHost();

  // Recovery side effects (offline/recovering/online lifecycle). This adds a
  // wake-aware window on top of TanStack's reconnect handling: a wake can start
  // recovery even when the device never reported offline.
  useConnectionRecovery({
    isOnline: isNetworkOnline,
    isFetching,
    isPaused,
    isError,
    dataUpdatedAt,
    notifications,
  });

  // Periodic account refreshes (startup + hourly interval)
  useAccounts();

  // Global keyboard shortcut registration, reverting on failure
  useShortcutRegistration();

  // Pause polling while the system is locked or suspended
  usePowerState();

  // oxlint-disable-next-line react/exhaustive-deps -- We want to update the tray on setting or notification changes
  useEffect(() => {
    const trayCount = status === 'error' ? -1 : notificationCount;
    setTrayIconColorAndTitle(trayCount, isNetworkOnline);
  }, [
    showNotificationsCountInTray,
    useUnreadActiveIcon,
    trayIconAppearance,
    status,
    notificationCount,
    isNetworkOnline,
  ]);

  useEffect(() => {
    return window.gitify.onResetApp(() => {
      resetAccounts();
      resetSettings();
      resetFilters();
      queryClient.clear();
      useConnectionStore.getState().settle();
      useShortcutRegistrationStore.getState().reset();
      window.gitify.nativeNotifications.removeAll();
    });
  }, [resetAccounts, resetSettings, resetFilters, queryClient]);

  return null;
}
