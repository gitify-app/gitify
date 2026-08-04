import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  focusManager,
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { Constants } from '../constants';

import {
  type NotificationActionFailure,
  type NotificationFailedActionType,
  useAccountsStore,
  useFiltersStore,
  useNotificationActionFailuresStore,
  useSettingsStore,
} from '../stores';

import {
  type Account,
  type AccountNotifications,
  type GitifyError,
  type GitifyNotification,
  type Status,
} from '../types';

import { isMarkAsDoneFeatureSupported, isUnsubscribeThreadSupported } from '../utils/api/features';
import { notificationsKeys } from '../utils/api/queryKeys';
import { getAccountUUID } from '../utils/auth/utils';
import { areAllAccountErrorsSame, doesAllAccountsHaveErrors, Errors } from '../utils/core/errors';
import { rendererLogError, toError } from '../utils/core/logger';
import { getAdapter } from '../utils/forges/registry';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
} from '../utils/notifications/filters/filter';
import {
  restoreFailedNotifications,
  settleNotificationActions,
  type NotificationQuerySnapshot,
} from '../utils/notifications/mutations';
import {
  getAllNotifications,
  getNotificationCount,
  getUnreadNotificationCount,
  refreshEnrichmentCache,
} from '../utils/notifications/notifications';
import { computeRefetchIntervalMs } from '../utils/notifications/pollInterval';
import { removeNotificationsForAccount } from '../utils/notifications/remove';
import { getNewNotifications } from '../utils/notifications/utils';
import { raiseSoundNotification } from '../utils/system/audio';
import { raiseNativeNotification } from '../utils/system/native';

interface NotificationsState {
  status: Status;
  globalError: GitifyError | undefined;

  notifications: AccountNotifications[];
  notificationCount: number;
  unreadNotificationCount: number;
  hasNotifications: boolean;
  hasUnreadNotifications: boolean;

  refetchNotifications: () => Promise<void>;
  removeAccountNotifications: (account: Account) => Promise<void>;

  markNotificationsAsRead: (notifications: GitifyNotification[]) => Promise<void>;
  markNotificationsAsDone: (notifications: GitifyNotification[]) => Promise<void>;
  unsubscribeNotification: (notification: GitifyNotification) => Promise<void>;

  /**
   * Session-local map of notification ID to the classified error from its
   * most recent failed mark-as-read/mark-as-done/unsubscribe action attempt.
   * Not persisted and not part of the notifications data itself.
   */
  notificationFailures: Record<string, NotificationActionFailure>;
}

interface UseNotificationsOptions {
  /**
   * Run the singleton side effects (sound/native alerts for new notifications
   * and interval/focus/reconnect polling). Only the app-level effects host
   * should enable this; all other consumers share the query cache without
   * them.
   *
   * Polling is owned by the singleton host because TanStack Query schedules
   * `refetchInterval` per mounted observer, not per query. Every consumer
   * (each notification row, repo group, sidebar, etc.) would otherwise run
   * its own staggered poll timer, multiplying API requests.
   */
  withSideEffects?: boolean;
}

/**
 * Hook that manages all notification state and actions for the application.
 *
 * Fetching, polling and caching are handled by TanStack Query; account and
 * settings state are read from the Zustand stores. Safe to use from any
 * component - all consumers share the same query cache.
 *
 * @returns The current notifications state and action callbacks.
 */
export const useNotifications = ({
  withSideEffects = false,
}: UseNotificationsOptions = {}): NotificationsState => {
  const queryClient = useQueryClient();
  const previousNotificationsRef = useRef<AccountNotifications[]>([]);

  // Account store values
  const accounts = useAccountsStore((s) => s.accounts);

  // Filter store values
  const includeSearchTokens = useFiltersStore((s) => s.includeSearchTokens);
  const excludeSearchTokens = useFiltersStore((s) => s.excludeSearchTokens);
  const filterAccounts = useFiltersStore((s) => s.accounts);
  const userTypes = useFiltersStore((s) => s.userTypes);
  const subjectTypes = useFiltersStore((s) => s.subjectTypes);
  const states = useFiltersStore((s) => s.states);
  const reasons = useFiltersStore((s) => s.reasons);
  const reviewRequestTypes = useFiltersStore((s) => s.reviewRequestTypes);

  // Setting store values
  const fetchReadNotifications = useSettingsStore((s) => s.fetchReadNotifications);
  const fetchParticipatingNotifications = useSettingsStore((s) => s.participating);
  const fetchIntervalMs = useSettingsStore((s) => s.fetchInterval);
  const markAsDoneOnUnsubscribe = useSettingsStore((s) => s.markAsDoneOnUnsubscribe);
  const playSoundNewNotifications = useSettingsStore((s) => s.playSound);
  const showSystemNotifications = useSettingsStore((s) => s.showNotifications);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);

  // Query key excludes filters: the cache holds unfiltered data and filter
  // changes re-run the select below, applying instantly without refetching
  const notificationsQueryKey = useMemo(
    () =>
      notificationsKeys.list(
        accounts.map(getAccountUUID),
        fetchReadNotifications,
        fetchParticipatingNotifications,
      ),
    [accounts, fetchReadNotifications, fetchParticipatingNotifications],
  );

  // Create select function that depends on filter state
  const selectFilteredNotifications = useMemo(
    () => (data: AccountNotifications[]) =>
      data.map((accountNotifications) => ({
        ...accountNotifications,
        notifications: filterDetailedNotifications(
          filterBaseNotifications(accountNotifications.notifications),
        ) as GitifyNotification[],
      })),
    // oxlint-disable-next-line react/exhaustive-deps -- Recreate the selection function on filter store changes
    [
      includeSearchTokens,
      excludeSearchTokens,
      filterAccounts,
      userTypes,
      subjectTypes,
      states,
      reasons,
      reviewRequestTypes,
    ],
  );

  // Query for fetching notifications - TanStack Query handles polling and refetching
  const {
    data: notifications = [],
    isLoading,
    isFetching,
    isError,
    isPaused,
    refetch,
  } = useQuery<AccountNotifications[], Error>({
    queryKey: notificationsQueryKey,

    queryFn: async () => {
      return await getAllNotifications();
    },

    // Apply filters as a transformation on the cached data
    // This allows filter changes to instantly update without refetching
    select: selectFilteredNotifications,

    placeholderData: keepPreviousData,

    // Fresh for at least one poll cycle at the fastest possible interval, so
    // data isn't treated as stale before a refetch could realistically have
    // occurred. Uses the static floor rather than the live interval because
    // the latter stretches with `X-Poll-Interval`; pinning staleTime to it
    // would suppress mount/focus/reconnect refetches for as long as a forge
    // asks Gitify to back off. Only those refetches are stale-gated - the
    // poll itself fires on `refetchInterval` regardless.
    staleTime: Constants.MIN_FETCH_NOTIFICATIONS_INTERVAL_MS,

    // Only the singleton side-effects host polls. Other consumers share the
    // cached data and would otherwise each schedule their own refetch timer.
    // The interval is re-evaluated after each fetch so it stretches to the
    // latest server-recommended minimum (`X-Poll-Interval`) when required.
    refetchInterval: withSideEffects
      ? () => computeRefetchIntervalMs(fetchIntervalMs, accounts)
      : false,
    refetchOnMount: withSideEffects,
    refetchOnReconnect: withSideEffects,
    refetchOnWindowFocus: withSideEffects,
  });

  const notificationCount = getNotificationCount(notifications);

  const unreadNotificationCount = getUnreadNotificationCount(notifications);

  const hasNotifications = useMemo(() => notificationCount > 0, [notificationCount]);

  const hasUnreadNotifications = useMemo(
    () => unreadNotificationCount > 0,
    [unreadNotificationCount],
  );

  // Determine status and globalError from query state
  const status: Status = useMemo(() => {
    if (isLoading || isFetching) {
      return 'loading';
    }

    // Check if paused due to offline state first (instant detection)
    if (isPaused) {
      return 'error';
    }

    if (isError) {
      return 'error';
    }

    // Set error status if all accounts have errors
    if (doesAllAccountsHaveErrors(notifications)) {
      return 'error';
    }

    return 'success';
  }, [isLoading, isFetching, isPaused, isError, notifications]);

  const globalError: GitifyError | undefined = useMemo(() => {
    // If paused due to offline, show network error
    if (isPaused) {
      return Errors.OFFLINE;
    }

    if (notifications.length === 0) {
      return undefined;
    }

    // Set Global Error if all accounts have the same error
    const allAccountsHaveErrors = doesAllAccountsHaveErrors(notifications);
    const allAccountErrorsAreSame = areAllAccountErrorsSame(notifications);

    if (allAccountsHaveErrors && allAccountErrorsAreSame) {
      return notifications[0].error ?? undefined;
    }

    return undefined;
  }, [isPaused, notifications]);

  const refetchNotifications = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Refetch notifications immediately when the system wakes from sleep or the
  // user unlocks their screen, without waiting for the next poll interval.
  // Owned by the singleton side-effects host: every consumer registering a
  // wake listener would both multiply refetches and leak ipcRenderer
  // listeners on unmount.
  useEffect(() => {
    if (!withSideEffects) {
      return;
    }

    return window.gitify.onSystemWake(() => {
      refetch();
    });
  }, [withSideEffects, refetch]);

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
    if (!withSideEffects) {
      return;
    }

    return focusManager.subscribe((focused) => {
      if (focused && refreshEnrichmentCache(fetchIntervalMs)) {
        refetch();
      }
    });
  }, [withSideEffects, fetchIntervalMs, refetch]);

  const removeAccountNotifications = useCallback(
    async (account: Account) => {
      const accountUUID = getAccountUUID(account);

      queryClient.setQueryData<AccountNotifications[]>(
        notificationsQueryKey,
        (existing) =>
          existing?.filter(
            (accountNotifications) => getAccountUUID(accountNotifications.account) !== accountUUID,
          ) ?? [],
      );
    },
    [queryClient, notificationsQueryKey],
  );

  // Handle sound and native notifications when new notifications arrive
  useEffect(() => {
    if (!withSideEffects || isLoading || isError || notifications.length === 0) {
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
          raiseSoundNotification(notificationVolume);
        }

        if (showSystemNotifications) {
          raiseNativeNotification(filteredDiffNotifications);
        }
      }
    }

    previousNotificationsRef.current = unfilteredNotifications;
  }, [
    withSideEffects,
    notifications,
    isLoading,
    isError,
    playSoundNewNotifications,
    showSystemNotifications,
    notificationVolume,
    queryClient,
    notificationsQueryKey,
  ]);

  const notificationFailures = useNotificationActionFailuresStore((s) => s.failures);

  // Session-local failure entries are independent of the notifications
  // cache, so they must be pruned separately once a notification no longer
  // appears in the (unfiltered) list - e.g. actioned successfully elsewhere,
  // or its account was removed. Owned by the singleton side-effects host so
  // it runs once per notifications update rather than once per mounted
  // row/consumer.
  useEffect(() => {
    if (!withSideEffects) {
      return;
    }

    const unfilteredNotifications =
      queryClient.getQueryData<AccountNotifications[]>(notificationsQueryKey) || [];

    const currentNotificationIds = unfilteredNotifications.flatMap((accountNotifications) =>
      accountNotifications.notifications.map((notification) => notification.id),
    );

    useNotificationActionFailuresStore.getState().pruneFailures(currentNotificationIds);
  }, [withSideEffects, notifications, queryClient, notificationsQueryKey]);

  // Shared by all three mutations' `onSuccess`. Records each failure's
  // classified error in the session-local failure map and logs it; also
  // re-applies `snapshot` for any failed notification missing from the
  // cache, as a defensive guard (these mutations don't remove notifications
  // until they succeed, so this is normally a no-op).
  const reconcileFailedNotifications = useCallback(
    (
      failed: Array<{ notification: GitifyNotification; error: GitifyError; rawError: Error }>,
      snapshot: NotificationQuerySnapshot | undefined,
      action: NotificationFailedActionType,
      context: string,
    ) => {
      if (failed.length === 0) {
        return;
      }

      const failedNotifications = failed.map((f) => f.notification);

      if (snapshot) {
        for (const [queryKey, snapshotData] of snapshot) {
          queryClient.setQueryData<AccountNotifications[]>(queryKey, (existing) =>
            restoreFailedNotifications(failedNotifications, snapshotData ?? [], existing ?? []),
          );
        }
      }

      for (const { notification, error, rawError } of failed) {
        useNotificationActionFailuresStore.getState().setFailure(notification.id, {
          action,
          error,
        });
        rendererLogError(
          context,
          `Error occurred while processing notification ${notification.id}`,
          rawError,
        );
      }
    },
    [queryClient],
  );

  // Full-cache restore for `onError`, covering the rare case where a
  // mutation function throws directly (e.g. a bug) rather than resolving via
  // `settleNotificationActions`. Per-notification failures are handled by
  // `reconcileFailedNotifications` above instead.
  const restoreSnapshot = useCallback(
    (snapshot?: NotificationQuerySnapshot) => {
      if (!snapshot) {
        return;
      }

      for (const [queryKey, data] of snapshot) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    [queryClient],
  );

  const markNotificationsAsReadMutation = useMutation({
    mutationFn: async ({ readNotifications }: { readNotifications: GitifyNotification[] }) => {
      return await settleNotificationActions(readNotifications, (notification) =>
        getAdapter(notification.account).markThreadAsRead(notification.account, notification.id),
      );
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.all });

      const snapshot = queryClient.getQueriesData<AccountNotifications[]>({
        queryKey: notificationsKeys.all,
      });

      return { snapshot };
    },

    onSuccess: ({ succeeded, failed }, _variables, context) => {
      // Cache removal happens here (once the request resolves) rather than
      // optimistically in `onMutate`, so the row's exit animation - started
      // synchronously on click - has time to play before the notification
      // disappears from the list.
      if (succeeded.length > 0) {
        queryClient.setQueryData<AccountNotifications[]>(notificationsQueryKey, (existing) =>
          removeNotificationsForAccount(succeeded[0].account, succeeded, existing ?? []),
        );
      }

      for (const notification of succeeded) {
        useNotificationActionFailuresStore.getState().clearFailure(notification.id);
      }

      reconcileFailedNotifications(
        failed,
        context?.snapshot,
        'markAsRead',
        'markNotificationsAsRead',
      );
    },

    onError: (err, _variables, context) => {
      restoreSnapshot(context?.snapshot);

      rendererLogError(
        'markNotificationsAsRead',
        'Error occurred while marking notifications as read',
        toError(err),
      );
    },
  });

  const markNotificationsAsDoneMutation = useMutation({
    mutationFn: async ({ doneNotifications }: { doneNotifications: GitifyNotification[] }) => {
      const account = doneNotifications[0].account;

      // Forges that don't support a distinct "done" state fall back to
      // marking as read so the user-visible action still removes the thread.
      if (!isMarkAsDoneFeatureSupported(account)) {
        return await markNotificationsAsReadMutation.mutateAsync({
          readNotifications: doneNotifications,
        });
      }

      return await settleNotificationActions(doneNotifications, (notification) =>
        getAdapter(notification.account).markThreadAsDone(notification.account, notification.id),
      );
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.all });

      const snapshot = queryClient.getQueriesData<AccountNotifications[]>({
        queryKey: notificationsKeys.all,
      });

      return { snapshot };
    },

    onSuccess: ({ succeeded, failed }, { doneNotifications }, context) => {
      // The mark-as-read fallback (for forges without a distinct "done"
      // state) already updated the cache via its own mutation/onSuccess.
      if (succeeded.length > 0 && isMarkAsDoneFeatureSupported(doneNotifications[0].account)) {
        queryClient.setQueryData<AccountNotifications[]>(notificationsQueryKey, (existing) =>
          removeNotificationsForAccount(succeeded[0].account, succeeded, existing ?? []),
        );
      }

      for (const notification of succeeded) {
        useNotificationActionFailuresStore.getState().clearFailure(notification.id);
      }

      reconcileFailedNotifications(
        failed,
        context?.snapshot,
        'markAsDone',
        'markNotificationsAsDone',
      );
    },

    onError: (err, _variables, context) => {
      restoreSnapshot(context?.snapshot);

      rendererLogError(
        'markNotificationsAsDone',
        'Error occurred while marking notifications as done',
        toError(err),
      );
    },
  });

  const unsubscribeNotificationMutation = useMutation({
    mutationFn: async ({ notification }: { notification: GitifyNotification }) => {
      // Forges without thread-subscription support cannot unsubscribe; the UI
      // already hides the action, but treat duplicate calls as no-ops.
      if (!isUnsubscribeThreadSupported(notification.account)) {
        return { succeeded: [notification], failed: [] };
      }

      const result = await settleNotificationActions([notification], (n) =>
        getAdapter(n.account).unsubscribeThread(n.account, n.id),
      );

      if (result.failed.length > 0) {
        return result;
      }

      if (markAsDoneOnUnsubscribe) {
        await markNotificationsAsDoneMutation.mutateAsync({
          doneNotifications: [notification],
        });
      } else {
        await markNotificationsAsReadMutation.mutateAsync({
          readNotifications: [notification],
        });
      }

      return result;
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.all });

      const snapshot = queryClient.getQueriesData<AccountNotifications[]>({
        queryKey: notificationsKeys.all,
      });

      return { snapshot };
    },

    onSuccess: ({ succeeded, failed }, _variables, context) => {
      for (const notification of succeeded) {
        useNotificationActionFailuresStore.getState().clearFailure(notification.id);
      }

      reconcileFailedNotifications(
        failed,
        context?.snapshot,
        'unsubscribe',
        'unsubscribeNotification',
      );
    },

    onError: (err, _variables, context) => {
      restoreSnapshot(context?.snapshot);

      rendererLogError(
        'unsubscribeNotification',
        'Error occurred while unsubscribing from notification thread',
        toError(err),
      );
    },
  });

  const markNotificationsAsRead = useCallback(
    async (readNotifications: GitifyNotification[]) => {
      await markNotificationsAsReadMutation.mutateAsync({ readNotifications }).catch(() => {});
    },
    [markNotificationsAsReadMutation],
  );

  const markNotificationsAsDone = useCallback(
    async (doneNotifications: GitifyNotification[]) => {
      await markNotificationsAsDoneMutation.mutateAsync({ doneNotifications }).catch(() => {});
    },
    [markNotificationsAsDoneMutation],
  );

  const unsubscribeNotification = useCallback(
    async (notification: GitifyNotification) => {
      await unsubscribeNotificationMutation.mutateAsync({ notification }).catch(() => {});
    },
    [unsubscribeNotificationMutation],
  );

  return {
    status,
    globalError,

    notifications,
    notificationCount,
    unreadNotificationCount,
    hasNotifications,
    hasUnreadNotifications,

    refetchNotifications,
    removeAccountNotifications,

    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,

    notificationFailures,
  };
};
