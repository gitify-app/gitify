import { useEffect, useRef } from 'react';

import { focusManager, type QueryKey, useQueryClient } from '@tanstack/react-query';

import {
  getNotificationFailureKey,
  useNotificationActionFailuresStore,
  useSettingsStore,
} from '../../stores';

import type { AccountNotifications, GitifyNotification } from '../../types';

import { doesAllAccountsHaveErrors } from '../../utils/core/errors';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
} from '../../utils/notifications/filters/filter';
import { refreshEnrichmentCache } from '../../utils/notifications/notifications';
import { getNewNotifications } from '../../utils/notifications/utils';
import { raiseSoundNotification } from '../../utils/system/audio';
import { raiseNativeNotification } from '../../utils/system/native';

export interface NotificationEffectsInput {
  /**
   * Run the singleton side effects. Only the app-level effects host should
   * enable this; all other consumers share the query cache without them.
   */
  enabled: boolean;
  notifications: AccountNotifications[];
  isLoading: boolean;
  isError: boolean;
  notificationsQueryKey: QueryKey;
  refetch: () => void;
  fetchIntervalMs: number;
}

/**
 * The side-effect half of notification state: sound and native alerts for new
 * notifications, refetch on system wake and window focus, and pruning of
 * session-local failure entries.
 *
 * Kept separate from the query and mutations so the side effects can be owned
 * by a single host rather than repeated per consumer.
 */
export const useNotificationEffects = ({
  enabled,
  notifications,
  isLoading,
  isError,
  notificationsQueryKey,
  refetch,
  fetchIntervalMs,
}: NotificationEffectsInput): void => {
  const queryClient = useQueryClient();
  const previousNotificationsRef = useRef<AccountNotifications[]>([]);

  const playSoundNewNotifications = useSettingsStore((s) => s.playSound);
  const showSystemNotifications = useSettingsStore((s) => s.showNotifications);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);

  // Refetch notifications immediately when the system wakes from sleep or the
  // user unlocks their screen, without waiting for the next poll interval.
  // Owned by the singleton side-effects host: every consumer registering a
  // wake listener would both multiply refetches and leak ipcRenderer
  // listeners on unmount.
  useEffect(() => {
    if (!enabled) {
      return;
    }

    return window.gitify.onSystemWake(() => {
      refetch();
    });
  }, [enabled, refetch]);

  // Enriched subject details are cached per `updatedAt`, which label,
  // milestone, and reaction changes never bump, so they can drift while the
  // app polls in the background. Drop the cache when the window regains focus
  // and refetch, so the inbox the user actually looks at re-enriches at that
  // moment. The refetch is explicit because the stale-gated focus refetch
  // (`refetchOnWindowFocus` above) does not fire within `staleTime`; when it
  // does fire too, TanStack dedupes the concurrent fetches. Clearing is
  // synchronous within the focus dispatch while any refetch reads the cache
  // only after its own awaits, so the clear always lands first. Throttled to
  // the fetch interval to avoid re-enrichment bursts from rapid open/close
  // cycles.
  useEffect(() => {
    if (!enabled) {
      return;
    }

    return focusManager.subscribe((focused) => {
      if (focused && refreshEnrichmentCache(fetchIntervalMs)) {
        refetch();
      }
    });
  }, [enabled, fetchIntervalMs, refetch]);

  // Handle sound and native notifications when new notifications arrive
  useEffect(() => {
    if (!enabled || isLoading || isError || notifications.length === 0) {
      return;
    }

    const allAccountsHaveErrors = doesAllAccountsHaveErrors(notifications);
    if (allAccountsHaveErrors) {
      return;
    }

    const unfilteredNotifications =
      queryClient.getQueryData<AccountNotifications[]>(notificationsQueryKey) || [];

    const diffNotifications = getNewNotifications(
      previousNotificationsRef.current,
      unfilteredNotifications,
    );

    if (diffNotifications.length > 0) {
      // Apply filters to new notifications so only filtered notifications trigger alerts
      const filteredDiffNotifications = filterDetailedNotifications(
        filterBaseNotifications(diffNotifications),
      ) as GitifyNotification[];

      if (filteredDiffNotifications.length > 0) {
        if (playSoundNewNotifications) {
          void raiseSoundNotification(notificationVolume);
        }

        if (showSystemNotifications) {
          void raiseNativeNotification(filteredDiffNotifications);
        }
      }
    }

    previousNotificationsRef.current = unfilteredNotifications;
  }, [
    enabled,
    notifications,
    isLoading,
    isError,
    playSoundNewNotifications,
    showSystemNotifications,
    notificationVolume,
    queryClient,
    notificationsQueryKey,
  ]);

  // Session-local failure entries are independent of the notifications
  // cache, so they must be pruned separately once a notification no longer
  // appears in the (unfiltered) list - e.g. actioned successfully elsewhere,
  // or its account was removed. Owned by the singleton side-effects host so
  // it runs once per notifications update rather than once per mounted
  // row/consumer.
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const unfilteredNotifications =
      queryClient.getQueryData<AccountNotifications[]>(notificationsQueryKey) || [];

    const currentNotificationKeys = unfilteredNotifications.flatMap((accountNotifications) =>
      accountNotifications.notifications.map((notification) =>
        getNotificationFailureKey(notification.account, notification.id),
      ),
    );

    useNotificationActionFailuresStore.getState().pruneFailures(currentNotificationKeys);
  }, [enabled, notifications, queryClient, notificationsQueryKey]);
};
