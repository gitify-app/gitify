import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useFiltersStore, useSettingsStore } from '../stores';

import type {
  Account,
  AccountNotifications,
  GitifyError,
  GitifyNotification,
  Status,
} from '../types';

import {
  ignoreNotificationThreadSubscription,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
} from '../utils/api/client';
import { notificationsKeys } from '../utils/api/queryKeys';
import {
  areAllAccountErrorsSame,
  doesAllAccountsHaveErrors,
  Errors,
} from '../utils/errors';
import { isMarkAsDoneFeatureSupported } from '../utils/features';
import { rendererLogError } from '../utils/logger';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
} from '../utils/notifications/filters/filter';
import { raiseNativeNotification } from '../utils/notifications/native';
import {
  getAllNotifications,
  getNotificationCount,
  getUnreadNotificationCount,
} from '../utils/notifications/notifications';
import { removeNotificationsForAccount } from '../utils/notifications/remove';
import { raiseSoundNotification } from '../utils/notifications/sound';
import { getNewNotifications } from '../utils/notifications/utils';

interface NotificationsState {
  status: Status;
  globalError: GitifyError;

  notifications: AccountNotifications[];
  notificationCount: number;
  unreadNotificationCount: number;
  hasNotifications: boolean;
  hasUnreadNotifications: boolean;

  refetchNotifications: () => Promise<void>;

  markNotificationsAsRead: (
    notifications: GitifyNotification[],
  ) => Promise<void>;
  markNotificationsAsDone: (
    notifications: GitifyNotification[],
  ) => Promise<void>;
  unsubscribeNotification: (notification: GitifyNotification) => Promise<void>;
}

export const useNotifications = (accounts: Account[]): NotificationsState => {
  const queryClient = useQueryClient();
  const previousNotificationsRef = useRef<AccountNotifications[]>([]);

  const fetchIntervalMs = useSettingsStore((s) => s.fetchInterval);
  const markAsDoneOnUnsubscribe = useSettingsStore(
    (s) => s.markAsDoneOnUnsubscribe,
  );

  // Subscribe to filter store to trigger re-render when filters change
  // This ensures the select function gets recreated with latest filter state
  const includeSearchTokens = useFiltersStore((s) => s.includeSearchTokens);
  const excludeSearchTokens = useFiltersStore((s) => s.excludeSearchTokens);
  const userTypes = useFiltersStore((s) => s.userTypes);
  const subjectTypes = useFiltersStore((s) => s.subjectTypes);
  const states = useFiltersStore((s) => s.states);
  const reasons = useFiltersStore((s) => s.reasons);

  // Get settings to determine query key
  const fetchReadNotifications = useSettingsStore(
    (s) => s.fetchReadNotifications,
  );
  const fetchParticipatingNotifications = useSettingsStore(
    (s) => s.participating,
  );

  // Query key excludes filters to prevent API refetches on filter changes
  // Filters are applied client-side via subscription in subscriptions.ts
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: Recreate selection function on filter store changes
  const selectFilteredNotifications = useMemo(
    () => (data: AccountNotifications[]) =>
      data.map((accountNotifications) => ({
        ...accountNotifications,
        // TODO FIX THIS
        notifications: filterDetailedNotifications(
          filterBaseNotifications(accountNotifications.notifications),
        ),
      })),
    [
      includeSearchTokens,
      excludeSearchTokens,
      userTypes,
      subjectTypes,
      states,
      reasons,
    ],
  );

  // Query for fetching notifications - React Query handles polling and refetching
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

    refetchInterval: fetchIntervalMs,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  const notificationCount = getNotificationCount(notifications);

  const unreadNotificationCount = getUnreadNotificationCount(notifications);

  const hasNotifications = useMemo(
    () => notificationCount > 0,
    [notificationCount],
  );

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

    return 'success';
  }, [isLoading, isFetching, isPaused, isError]);

  const globalError: GitifyError = useMemo(() => {
    // If paused due to offline, show network error
    if (isPaused) {
      return Errors.NETWORK;
    }

    if (!isError || notifications.length === 0) {
      return null;
    }

    const allAccountsHaveErrors = doesAllAccountsHaveErrors(notifications);
    const allAccountErrorsAreSame = areAllAccountErrorsSame(notifications);

    if (allAccountsHaveErrors && allAccountErrorsAreSame) {
      return notifications[0].error;
    }

    return null;
  }, [isPaused, isError, notifications]);

  const refetchNotifications = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Get settings for notifications side effects
  const playSoundNewNotifications = useSettingsStore((s) => s.playSound);
  const showSystemNotifications = useSettingsStore((s) => s.showNotifications);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);

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
      queryClient.getQueryData<AccountNotifications[]>(notificationsQueryKey) ||
      [];

    const diffNotifications = getNewNotifications(
      previousNotificationsRef.current,
      unfilteredNotifications,
    );

    if (diffNotifications.length > 0) {
      // Apply filters to new notifications so only filtered notifications trigger alerts
      // TODO fix me
      const filteredDiffNotifications = filterDetailedNotifications(
        filterBaseNotifications(diffNotifications),
      );

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
    mutationFn: async ({
      readNotifications,
    }: {
      readNotifications: GitifyNotification[];
    }) => {
      await Promise.all(
        readNotifications.map((notification) =>
          markNotificationThreadAsRead(notification.account, notification.id),
        ),
      );

      const updatedNotifications = removeNotificationsForAccount(
        readNotifications[0].account,
        readNotifications,
        notifications,
      );

      return updatedNotifications;
    },

    onSuccess: (updatedNotifications) => {
      queryClient.setQueryData(notificationsQueryKey, updatedNotifications);
    },

    onError: (err) => {
      rendererLogError(
        'markNotificationsAsRead',
        'Error occurred while marking notifications as read',
        err,
      );
    },
  });

  const markNotificationsAsDoneMutation = useMutation({
    mutationFn: async ({
      doneNotifications,
    }: {
      doneNotifications: GitifyNotification[];
    }) => {
      if (!isMarkAsDoneFeatureSupported(doneNotifications[0].account)) {
        return;
      }

      await Promise.all(
        doneNotifications.map((notification) =>
          markNotificationThreadAsDone(notification.account, notification.id),
        ),
      );

      const updatedNotifications = removeNotificationsForAccount(
        doneNotifications[0].account,
        doneNotifications,
        notifications,
      );

      return updatedNotifications;
    },

    onSuccess: (updatedNotifications) => {
      queryClient.setQueryData(notificationsQueryKey, updatedNotifications);
    },

    onError: (err) => {
      rendererLogError(
        'markNotificationsAsDone',
        'Error occurred while marking notifications as done',
        err,
      );
    },
  });

  const unsubscribeNotificationMutation = useMutation({
    mutationFn: async ({
      notification,
    }: {
      notification: GitifyNotification;
    }) => {
      await ignoreNotificationThreadSubscription(
        notification.account,
        notification.id,
      );

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
        'Error occurred while unsubscribing notification threads',
        err,
      );
    },
  });

  const markNotificationsAsRead = useCallback(
    async (readNotifications: GitifyNotification[]) => {
      await markNotificationsAsReadMutation.mutateAsync({ readNotifications });
    },
    [markNotificationsAsReadMutation],
  );

  const markNotificationsAsDone = useCallback(
    async (doneNotifications: GitifyNotification[]) => {
      await markNotificationsAsDoneMutation.mutateAsync({
        doneNotifications,
      });
    },
    [markNotificationsAsDoneMutation],
  );

  const unsubscribeNotification = useCallback(
    async (notification: GitifyNotification) => {
      await unsubscribeNotificationMutation.mutateAsync({
        notification,
      });
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

    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  };
};
