import { useMemo } from 'react';

import { type QueryKey, useQuery } from '@tanstack/react-query';

import { Constants } from '../../constants';

import {
  useAccountsStore,
  useConnectionStore,
  useFiltersStore,
  usePowerStateStore,
  useSettingsStore,
} from '../../stores';

import type { AccountNotifications, GitifyError, GitifyNotification, Status } from '../../types';

import { doesAllAccountsHaveErrors } from '../../utils/core/errors';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
} from '../../utils/notifications/filters/filter';
import {
  getAllNotifications,
  getNotificationCount,
  getUnreadNotificationCount,
} from '../../utils/notifications/notifications';
import { computeNotificationRefetchIntervalMs } from '../../utils/notifications/pollInterval';
import { shouldUseRecoveryRetry } from '../../utils/notifications/recovery';
import { deriveGlobalError, deriveStatus } from '../../utils/notifications/status';
import { getNetworkStatus, useNetworkStatus } from '../useOnlineStatus';
import { useNotificationsQueryKey } from './useNotificationsQueryKey';

export interface NotificationsQueryResult {
  notifications: AccountNotifications[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  isPaused: boolean;
  dataUpdatedAt: number;
  notificationCount: number;
  unreadNotificationCount: number;
  hasNotifications: boolean;
  hasUnreadNotifications: boolean;
  status: Status;
  globalError: GitifyError | undefined;
  notificationsQueryKey: QueryKey;
  fetchIntervalMs: number;
  refetch: () => void;
}

/**
 * Keep previous notifications visible across query-key changes only when they
 * contain actual content or account errors. An account set with empty inboxes is
 * not content: it must not make a new account set look settled. Returning
 * undefined lets the query report initial loading instead.
 */
function keepNonEmptyPreviousData(
  previousData: AccountNotifications[] | undefined,
): AccountNotifications[] | undefined {
  return previousData?.some((account) => account.notifications.length > 0 || account.error !== null)
    ? previousData
    : undefined;
}

async function fetchNotificationsWithReconnect() {
  const connectionAtStart = getNetworkStatus();
  const hasReconnected = () => {
    const currentConnection = getNetworkStatus();
    return currentConnection.isOnline && currentConnection !== connectionAtStart;
  };

  try {
    const notifications = await getAllNotifications();
    if (!doesAllAccountsHaveErrors(notifications) || !hasReconnected()) {
      return notifications;
    }
  } catch (error) {
    if (!hasReconnected()) {
      throw error;
    }
  }

  // TanStack reuses the in-flight request on reconnect. If that request failed,
  // make one fresh attempt before committing a failed result to the cache.
  return getAllNotifications();
}

/**
 * The read side of notification state: the TanStack Query observer (optionally
 * polling), the filter projection, derived counts, and the derived status and
 * global error.
 *
 * `poll` distinguishes the single app-level host observer - which schedules the
 * poll interval - from the many read-only consumers, which share the same cache
 * entry but schedule nothing. See `useNotificationsHost`.
 */
export const useNotificationsQuery = ({ poll }: { poll: boolean }): NotificationsQueryResult => {
  const { isOnline: isNetworkOnline, reconnectedAt } = useNetworkStatus();

  // Account store values
  const accounts = useAccountsStore((s) => s.accounts);
  const isPowerActive = usePowerStateStore((s) => s.isActive);
  const connectionState = useConnectionStore((s) => s.state);

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
  const fetchIntervalMs = useSettingsStore((s) => s.fetchInterval);

  // Query key excludes filters: the cache holds unfiltered data and filter
  // changes re-run the select below, applying instantly without refetching.
  // Shared with the action-only surface so both target the same cache entry.
  const notificationsQueryKey = useNotificationsQueryKey();

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
    dataUpdatedAt,
    errorUpdatedAt,
    isLoading,
    isFetching,
    isError,
    isPending,
    isPaused,
    refetch,
  } = useQuery<AccountNotifications[], Error>({
    queryKey: notificationsQueryKey,

    queryFn: fetchNotificationsWithReconnect,

    // Apply filters as a transformation on the cached data
    // This allows filter changes to instantly update without refetching
    select: selectFilteredNotifications,

    placeholderData: keepNonEmptyPreviousData,

    // Fresh for at least one poll cycle at the fastest possible interval, so
    // data isn't treated as stale before a refetch could realistically have
    // occurred. Uses the static floor rather than the live interval because
    // the latter stretches with `X-Poll-Interval`; pinning staleTime to it
    // would suppress mount/focus/reconnect refetches for as long as a forge
    // asks Gitify to back off. The poll itself fires on `refetchInterval`
    // regardless; reconnect also bypasses this guard for failed results.
    staleTime: Constants.MIN_FETCH_NOTIFICATIONS_INTERVAL_MS,

    // Only the singleton host observer polls. Other consumers share the cached
    // data and would otherwise each schedule their own refetch timer. The
    // interval is re-evaluated after each fetch so it stretches to the latest
    // server-recommended minimum (`X-Poll-Interval`) when required. While the
    // recovery window is open and the latest settled fetch is a retryable
    // connection failure, retry on the short recovery cadence instead.
    refetchInterval:
      poll && isPowerActive
        ? (query) =>
            computeNotificationRefetchIntervalMs({
              userIntervalMs: fetchIntervalMs,
              accounts,
              recoveryRetry: shouldUseRecoveryRetry(
                useConnectionStore.getState().state,
                query.state.data ?? [],
              ),
              recoveryRetryIntervalMs: Constants.RECOVERY_RETRY_INTERVAL_MS,
            })
        : false,
    refetchOnMount: poll,
    // Retry an errored result on reconnect even if it's still fresh. Successful
    // results retain the usual stale-time guard.
    refetchOnReconnect:
      poll &&
      (({ state }) =>
        state.status === 'error' || doesAllAccountsHaveErrors(state.data ?? []) ? 'always' : true),
    refetchOnWindowFocus: poll,
  });

  const notificationCount = getNotificationCount(notifications);

  const unreadNotificationCount = getUnreadNotificationCount(notifications);

  const hasNotifications = useMemo(() => notificationCount > 0, [notificationCount]);

  const hasUnreadNotifications = useMemo(
    () => unreadNotificationCount > 0,
    [unreadNotificationCount],
  );

  // Query keeps the previous result during a refetch. Use the same timestamps
  // for every observer, including one mounted halfway through the reconnect.
  // The connection store adds a wake-aware recovery window: a wake can start
  // recovery even when the device never reported offline, so there is no
  // `reconnectedAt` transition to rely on.
  const lastResultAt = isError ? errorUpdatedAt : dataUpdatedAt;
  const isRecovering =
    connectionState === 'recovering' ||
    (reconnectedAt !== undefined && lastResultAt < reconnectedAt);
  const status = deriveStatus({
    isNetworkOnline,
    isLoading,
    isPending,
    isPaused,
    isRecovering,
    isError,
    notifications,
  });

  const globalError: GitifyError | undefined = useMemo(
    () => deriveGlobalError({ status, notifications }),
    [status, notifications],
  );

  return {
    notifications,
    isLoading,
    isError,
    isFetching,
    isPaused,
    dataUpdatedAt,
    notificationCount,
    unreadNotificationCount,
    hasNotifications,
    hasUnreadNotifications,
    status,
    globalError,
    notificationsQueryKey,
    fetchIntervalMs,
    refetch,
  };
};
