import { useCallback, useEffect, useEffectEvent, useRef } from 'react';

import { focusManager, type QueryKey, useQueryClient } from '@tanstack/react-query';

import type {
  INativeNotificationActionEvent,
  INativeNotificationClickEvent,
} from '../../../shared/events';
import {
  getNativeNotificationId,
  NATIVE_NOTIFICATION_SUMMARY_ID,
} from '../../../shared/nativeNotifications';

import {
  getNotificationFailureKey,
  useNotificationActionFailuresStore,
  useSettingsStore,
} from '../../stores';

import type { AccountNotifications, GitifyNotification } from '../../types';

import { getAccountUUID } from '../../utils/auth/utils';
import { doesAllAccountsHaveErrors } from '../../utils/core/errors';
import { rendererLogError, toError } from '../../utils/core/logger';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
} from '../../utils/notifications/filters/filter';
import { refreshEnrichmentCache } from '../../utils/notifications/notifications';
import { getNewNotifications } from '../../utils/notifications/utils';
import { raiseSoundNotification } from '../../utils/system/audio';
import { openNotification } from '../../utils/system/links';
import { raiseNativeNotification } from '../../utils/system/native';
import type { NotificationActions } from './useNotificationActions';

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
  actions: NotificationActions;
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
  actions,
}: NotificationEffectsInput): void => {
  const queryClient = useQueryClient();
  const previousNotificationsRef = useRef<AccountNotifications[]>([]);
  const actionsRef = useRef(actions);
  const publishedIdsRef = useRef<Set<string>>(new Set());

  const playSoundNewNotifications = useSettingsStore((s) => s.playSound);
  const showSystemNotifications = useSettingsStore((s) => s.showNotifications);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);

  const announceNewNotifications = useEffectEvent(
    (filteredDiffNotifications: GitifyNotification[]) => {
      if (playSoundNewNotifications) {
        void raiseSoundNotification(notificationVolume);
      }

      if (showSystemNotifications) {
        void Promise.resolve(raiseNativeNotification(filteredDiffNotifications))
          .then((published) => {
            for (const payload of published ?? []) {
              publishedIdsRef.current.add(payload.id);
            }
          })
          .catch((error) => {
            rendererLogError(
              'useNotificationEffects',
              'Failed to publish native notifications',
              toError(error),
            );
          });
      }
    },
  );

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  const readUnfilteredNotifications = useCallback(
    () => queryClient.getQueryData<AccountNotifications[]>(notificationsQueryKey) ?? [],
    [queryClient, notificationsQueryKey],
  );

  const resolveNotification = useCallback(
    (id: string): GitifyNotification | null => {
      if (!id || id === NATIVE_NOTIFICATION_SUMMARY_ID) {
        return null;
      }

      for (const accountNotifications of readUnfilteredNotifications()) {
        const accountUUID = getAccountUUID(accountNotifications.account);

        for (const notification of accountNotifications.notifications) {
          if (getNativeNotificationId(accountUUID, notification.id) === id) {
            return notification;
          }
        }
      }

      return null;
    },
    [readUnfilteredNotifications],
  );

  const handleNativeAction = useCallback(
    (payload: INativeNotificationActionEvent) => {
      const notification = resolveNotification(payload.id);

      if (notification) {
        void actionsRef.current.markNotificationsAsRead([notification], {
          optimistic: true,
        });
      }
    },
    [resolveNotification],
  );

  const handleNativeClick = useCallback(
    (payload: INativeNotificationClickEvent) => {
      const notification = resolveNotification(payload.id);

      if (notification) {
        void openNotification(notification);
        return;
      }

      window.gitify.app.show();
    },
    [resolveNotification],
  );

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

  // Register OS notification interaction listeners exactly once for the host.
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const unsubscribeAction = window.gitify.nativeNotifications.onAction(handleNativeAction);
    const unsubscribeClick = window.gitify.nativeNotifications.onClick(handleNativeClick);

    window.gitify.nativeNotifications.notifyReady();

    return () => {
      unsubscribeAction();
      unsubscribeClick();
    };
  }, [enabled, handleNativeAction, handleNativeClick]);

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
        announceNewNotifications(filteredDiffNotifications);
      }
    }

    previousNotificationsRef.current = unfilteredNotifications;
  }, [enabled, notifications, isLoading, isError, queryClient, notificationsQueryKey]);

  // Remove published notifications when they become read, leave the cache,
  // or when no unread notifications remain for the summary.
  useEffect(() => {
    if (!enabled || publishedIdsRef.current.size === 0) {
      return;
    }

    const unfilteredNotifications = readUnfilteredNotifications();
    const unreadIds = new Set(
      unfilteredNotifications.flatMap((accountNotifications) => {
        const accountUUID = getAccountUUID(accountNotifications.account);

        return accountNotifications.notifications
          .filter((notification) => notification.unread)
          .map((notification) => getNativeNotificationId(accountUUID, notification.id));
      }),
    );
    const hasUnread = unfilteredNotifications.some((accountNotifications) =>
      accountNotifications.notifications.some((notification) => notification.unread),
    );

    const removed = [...publishedIdsRef.current].filter((id) =>
      id === NATIVE_NOTIFICATION_SUMMARY_ID ? !hasUnread : !unreadIds.has(id),
    );

    if (removed.length === 0) {
      return;
    }

    window.gitify.nativeNotifications.remove({ ids: removed });

    for (const id of removed) {
      publishedIdsRef.current.delete(id);
    }
  }, [enabled, notifications, readUnfilteredNotifications]);

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
