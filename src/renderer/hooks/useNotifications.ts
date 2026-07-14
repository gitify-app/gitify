import { useCallback, useEffect, useMemo, useRef } from 'react';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { FetchType, useAccountsStore, useFiltersStore, useSettingsStore } from '../stores';

import type {
  Account,
  AccountNotifications,
  GitifyError,
  GitifyNotification,
  Status,
} from '../types';

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
  getAllNotifications,
  getNotificationCount,
  getUnreadNotificationCount,
} from '../utils/notifications/notifications';
import { removeNotificationsForAccount } from '../utils/notifications/remove';
import { getNewNotifications } from '../utils/notifications/utils';
import { raiseSoundNotification } from '../utils/system/audio';
import { raiseNativeNotification } from '../utils/system/native';
import { useInactivityTimer } from './timers/useInactivityTimer';

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
}

/**
 * Hook that manages all notification state and actions for the application.
 *
 * Fetching, polling and caching are handled by TanStack Query; account and
 * settings state are read from the Zustand stores.
 *
 * @returns The current notifications state and action callbacks.
 */
export const useNotifications = (): NotificationsState => {
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
  const fetchType = useSettingsStore((s) => s.fetchType);
  const fetchIntervalMs = useSettingsStore((s) => s.fetchInterval);
  const markAsDoneOnUnsubscribe = useSettingsStore((s) => s.markAsDoneOnUnsubscribe);
  const playSoundNewNotifications = useSettingsStore((s) => s.playSound);
  const showSystemNotifications = useSettingsStore((s) => s.showNotifications);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);

  // Query key excludes filters; filter changes re-run the select for instant
  // narrowing and trigger a refetch via the subscription in subscriptions.ts
  const notificationsQueryKey = useMemo(
    () =>
      notificationsKeys.list(
        accounts.length,
        fetchReadNotifications,
        fetchParticipatingNotifications,
      ),
    [accounts.length, fetchReadNotifications, fetchParticipatingNotifications],
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

    refetchInterval: fetchType === FetchType.INTERVAL ? fetchIntervalMs : false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  // Inactivity-based fetching re-fetches once the user has been idle for the
  // configured interval, instead of polling on a fixed schedule.
  useInactivityTimer(
    () => {
      refetch();
    },
    fetchType === FetchType.INACTIVITY ? fetchIntervalMs : null,
  );

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
    if (isLoading || isError || notifications.length === 0) {
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
    notifications,
    isLoading,
    isError,
    playSoundNewNotifications,
    showSystemNotifications,
    notificationVolume,
    queryClient,
    notificationsQueryKey,
  ]);

  const markNotificationsAsReadMutation = useMutation({
    mutationFn: async ({ readNotifications }: { readNotifications: GitifyNotification[] }) => {
      await Promise.all(
        readNotifications.map((notification) =>
          getAdapter(notification.account).markThreadAsRead(notification.account, notification.id),
        ),
      );
    },

    onSuccess: (_, { readNotifications }) => {
      // Update the cached (unfiltered) data in place so filtered-out
      // notifications are preserved and concurrent mutations compose.
      queryClient.setQueryData<AccountNotifications[]>(notificationsQueryKey, (existing) =>
        removeNotificationsForAccount(
          readNotifications[0].account,
          readNotifications,
          existing ?? [],
        ),
      );
    },

    onError: (err) => {
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
      if (!getAdapter(account).capabilities.markAsDone(account)) {
        await markNotificationsAsReadMutation.mutateAsync({
          readNotifications: doneNotifications,
        });
        return false;
      }

      await Promise.all(
        doneNotifications.map((notification) =>
          getAdapter(notification.account).markThreadAsDone(notification.account, notification.id),
        ),
      );

      return true;
    },

    onSuccess: (didMarkAsDone, { doneNotifications }) => {
      // The mark-as-read fallback already updated the cache.
      if (!didMarkAsDone) {
        return;
      }

      queryClient.setQueryData<AccountNotifications[]>(notificationsQueryKey, (existing) =>
        removeNotificationsForAccount(
          doneNotifications[0].account,
          doneNotifications,
          existing ?? [],
        ),
      );
    },

    onError: (err) => {
      rendererLogError(
        'markNotificationsAsDone',
        'Error occurred while marking notifications as done',
        toError(err),
      );
    },
  });

  const unsubscribeNotificationMutation = useMutation({
    mutationFn: async ({ notification }: { notification: GitifyNotification }) => {
      const adapter = getAdapter(notification.account);

      // Forges without thread-subscription support cannot unsubscribe; the UI
      // already hides the action, but treat duplicate calls as no-ops.
      if (!adapter.capabilities.unsubscribeThread(notification.account)) {
        return;
      }

      await adapter.unsubscribeThread(notification.account, notification.id);

      if (markAsDoneOnUnsubscribe) {
        await markNotificationsAsDoneMutation.mutateAsync({
          doneNotifications: [notification],
        });
      } else {
        await markNotificationsAsReadMutation.mutateAsync({
          readNotifications: [notification],
        });
      }
    },

    onError: (err) => {
      rendererLogError(
        'unsubscribeNotification',
        'Error occurred while unsubscribing from notification thread',
        toError(err),
      );
    },
  });

  // Mutation failures are logged via each mutation's onError handler and
  // swallowed here so UI callers can fire-and-forget these actions.
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
  };
};
