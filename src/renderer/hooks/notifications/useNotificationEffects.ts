import { useCallback, useEffect, useRef } from 'react';

import { focusManager, type QueryKey, useQueryClient } from '@tanstack/react-query';

import type {
  INativeNotificationActionEvent,
  INativeNotificationClickEvent,
  NativeNotificationActionId,
} from '../../../shared/events';
import {
  getNativeNotificationId,
  NATIVE_NOTIFICATION_SUMMARY_ID,
} from '../../../shared/nativeNotifications';

import {
  getNotificationFailureKey,
  useNotificationActionFailuresStore,
  useNotificationFocusStore,
  useSettingsStore,
} from '../../stores';

import type { AccountNotifications, GitifyNotification, Link } from '../../types';
import { NativeNotificationClickAction } from '../../types';

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
import { openExternalLink } from '../../utils/system/comms';
import { openNotification } from '../../utils/system/links';
import { raiseNativeNotification } from '../../utils/system/native';
import type { NotificationActions } from './useNotificationActions';

const PENDING_INTERACTION_TTL_MS = 30_000;
const MAX_PENDING_INTERACTIONS = 20;

interface PendingInteraction {
  payload: INativeNotificationActionEvent;
  expiresAt: number;
}

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
  /** Navigate to the notifications route when a notification is revealed. */
  onReveal: () => void;
}

/**
 * The side-effect half of notification state: sound and native alerts for new
 * notifications, OS notification interactions and lifecycle cleanup, refetch on
 * system wake and window focus, and pruning of session-local failure entries.
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
  onReveal,
}: NotificationEffectsInput): void => {
  const queryClient = useQueryClient();
  const previousNotificationsRef = useRef<AccountNotifications[]>([]);
  const actionsRef = useRef(actions);
  const onRevealRef = useRef(onReveal);
  const publishedIdsRef = useRef<Set<string>>(new Set());
  const publishedUrlsRef = useRef<Map<string, string>>(new Map());
  const pendingInteractionsRef = useRef<PendingInteraction[]>([]);

  useEffect(() => {
    actionsRef.current = actions;
    onRevealRef.current = onReveal;
  }, [actions, onReveal]);

  const playSoundNewNotifications = useSettingsStore((s) => s.playSound);
  const showSystemNotifications = useSettingsStore((s) => s.showNotifications);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);
  const nativeNotificationStyle = useSettingsStore((s) => s.nativeNotificationStyle);
  const nativeNotificationActions = useSettingsStore((s) => s.nativeNotificationActions);
  const nativeNotificationKeepVisible = useSettingsStore((s) => s.nativeNotificationKeepVisible);

  const readUnfilteredNotifications = useCallback(
    () => queryClient.getQueryData<AccountNotifications[]>(notificationsQueryKey) ?? [],
    [queryClient, notificationsQueryKey],
  );

  // Identities are one-way hashes, so resolve one by hashing the cached
  // notifications and matching.
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

  const executeAction = useCallback(
    (action: NativeNotificationActionId, notification: GitifyNotification) => {
      switch (action) {
        case 'show':
          return;
        case 'read':
          void actionsRef.current.markNotificationsAsRead([notification]);
          return;
        case 'done':
          void actionsRef.current.markNotificationsAsDone([notification]);
          return;
        case 'unsubscribe':
          void actionsRef.current.unsubscribeNotification(notification);
          return;
        default:
          return;
      }
    },
    [],
  );

  const handleNativeClick = useCallback(
    (payload: INativeNotificationClickEvent) => {
      const notification = resolveNotification(payload.id);

      if (
        useSettingsStore.getState().nativeNotificationClickAction ===
        NativeNotificationClickAction.BROWSER
      ) {
        if (notification) {
          void openNotification(notification);
          return;
        }

        const fallbackUrl = publishedUrlsRef.current.get(payload.id);

        if (fallbackUrl) {
          openExternalLink(fallbackUrl as Link);
          return;
        }

        window.gitify.app.show();
        onRevealRef.current();
        return;
      }

      window.gitify.app.show();
      onRevealRef.current();

      if (notification) {
        useNotificationFocusStore
          .getState()
          .requestFocus(getAccountUUID(notification.account), notification.id);
      }
    },
    [resolveNotification],
  );

  const handleNativeAction = useCallback(
    (payload: INativeNotificationActionEvent) => {
      if (payload.action === 'show') {
        handleNativeClick({ id: payload.id });
        return;
      }

      const notification = resolveNotification(payload.id);

      if (!notification) {
        pendingInteractionsRef.current.push({
          payload,
          expiresAt: Date.now() + PENDING_INTERACTION_TTL_MS,
        });

        if (pendingInteractionsRef.current.length > MAX_PENDING_INTERACTIONS) {
          pendingInteractionsRef.current.shift();
        }

        return;
      }

      executeAction(payload.action, notification);
    },
    [executeAction, handleNativeClick, resolveNotification],
  );

  const processPendingInteractions = useCallback(() => {
    if (pendingInteractionsRef.current.length === 0) {
      return;
    }

    const now = Date.now();
    const remaining: PendingInteraction[] = [];

    for (const pending of pendingInteractionsRef.current) {
      if (pending.expiresAt <= now) {
        continue;
      }

      const notification = resolveNotification(pending.payload.id);

      if (!notification) {
        remaining.push(pending);
        continue;
      }

      executeAction(pending.payload.action, notification);
    }

    pendingInteractionsRef.current = remaining;
  }, [executeAction, resolveNotification]);

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

  // Retry interactions that arrived before the notification cache settled.
  useEffect(() => {
    if (enabled) {
      processPendingInteractions();
    }
  }, [enabled, notifications, processPendingInteractions]);

  // Handle sound and native notifications when new notifications arrive.
  useEffect(() => {
    if (!enabled || isLoading || isError || notifications.length === 0) {
      return;
    }

    const allAccountsHaveErrors = doesAllAccountsHaveErrors(notifications);
    if (allAccountsHaveErrors) {
      return;
    }

    const unfilteredNotifications = readUnfilteredNotifications();

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
          void Promise.resolve(
            raiseNativeNotification(filteredDiffNotifications, {
              style: nativeNotificationStyle,
              actions: nativeNotificationActions,
              keepVisible: nativeNotificationKeepVisible,
            }),
          )
            .then((published) => {
              for (const { payload, url } of published ?? []) {
                publishedIdsRef.current.add(payload.id);

                if (url) {
                  publishedUrlsRef.current.set(payload.id, url);
                }
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
    nativeNotificationStyle,
    nativeNotificationActions,
    nativeNotificationKeepVisible,
    readUnfilteredNotifications,
  ]);

  // Remove published notifications when they leave the unfiltered cache,
  // including read/done/unsubscribe, account removal, and reset.
  useEffect(() => {
    if (!enabled || publishedIdsRef.current.size === 0) {
      return;
    }

    const unfilteredNotifications = readUnfilteredNotifications();
    const currentIds = new Set(
      unfilteredNotifications.flatMap((accountNotifications) => {
        const accountUUID = getAccountUUID(accountNotifications.account);
        return accountNotifications.notifications.map((notification) =>
          getNativeNotificationId(accountUUID, notification.id),
        );
      }),
    );
    // The summary stands for the whole batch, so keep it until nothing unread
    // remains rather than removing it because it matches no single notification.
    const hasUnread = unfilteredNotifications.some((accountNotifications) =>
      accountNotifications.notifications.some((notification) => notification.unread),
    );

    const removed = [...publishedIdsRef.current].filter((id) =>
      id === NATIVE_NOTIFICATION_SUMMARY_ID ? !hasUnread : !currentIds.has(id),
    );

    if (removed.length === 0) {
      return;
    }

    window.gitify.nativeNotifications.remove({ ids: removed });

    for (const id of removed) {
      publishedIdsRef.current.delete(id);
      publishedUrlsRef.current.delete(id);
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

    const unfilteredNotifications = readUnfilteredNotifications();

    const currentNotificationKeys = unfilteredNotifications.flatMap((accountNotifications) =>
      accountNotifications.notifications.map((notification) =>
        getNotificationFailureKey(notification.account, notification.id),
      ),
    );

    useNotificationActionFailuresStore.getState().pruneFailures(currentNotificationKeys);
  }, [enabled, notifications, readUnfilteredNotifications]);
};
