import { useMemo } from 'react';

import { type QueryKey, useQuery } from '@tanstack/react-query';

import { Constants } from '../../constants';

import {
  useAccountsStore,
  useFiltersStore,
  usePowerStateStore,
  useSettingsStore,
} from '../../stores';

import type { AccountNotifications, GitifyError, GitifyNotification, Status } from '../../types';

import {
  filterBaseNotifications,
  filterDetailedNotifications,
} from '../../utils/notifications/filters/filter';
import {
  getAllNotifications,
  getNotificationCount,
  getUnreadNotificationCount,
} from '../../utils/notifications/notifications';
import { computeRefetchIntervalMs } from '../../utils/notifications/pollInterval';
import { deriveGlobalError, deriveStatus } from '../../utils/notifications/status';
import { useNotificationsQueryKey } from './useNotificationsQueryKey';

export interface NotificationsQueryResult {
  notifications: AccountNotifications[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
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
  // Account store values
  const accounts = useAccountsStore((s) => s.accounts);
  const isPowerActive = usePowerStateStore((s) => s.isActive);

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

    placeholderData: keepNonEmptyPreviousData,

    // Fresh for at least one poll cycle at the fastest possible interval, so
    // data isn't treated as stale before a refetch could realistically have
    // occurred. Uses the static floor rather than the live interval because
    // the latter stretches with `X-Poll-Interval`; pinning staleTime to it
    // would suppress mount/focus/reconnect refetches for as long as a forge
    // asks Gitify to back off. Only those refetches are stale-gated - the
    // poll itself fires on `refetchInterval` regardless.
    staleTime: Constants.MIN_FETCH_NOTIFICATIONS_INTERVAL_MS,

    // Only the singleton host observer polls. Other consumers share the cached
    // data and would otherwise each schedule their own refetch timer. The
    // interval is re-evaluated after each fetch so it stretches to the latest
    // server-recommended minimum (`X-Poll-Interval`) when required.
    refetchInterval:
      poll && isPowerActive ? () => computeRefetchIntervalMs(fetchIntervalMs, accounts) : false,
    refetchOnMount: poll,
    refetchOnReconnect: poll,
    refetchOnWindowFocus: poll,
  });

  const notificationCount = getNotificationCount(notifications);

  const unreadNotificationCount = getUnreadNotificationCount(notifications);

  const hasNotifications = useMemo(() => notificationCount > 0, [notificationCount]);

  const hasUnreadNotifications = useMemo(
    () => unreadNotificationCount > 0,
    [unreadNotificationCount],
  );

  // Determine status and globalError from query state. Only the initial
  // fetch (no settled success or error yet) reports 'loading' - background
  // refetches of already-settled data keep their settled status so
  // consumers like the tray icon don't flicker on every poll/retry.
  const status: Status = useMemo(
    () => deriveStatus({ isLoading, isPaused, isError, notifications }),
    [isLoading, isPaused, isError, notifications],
  );

  const globalError: GitifyError | undefined = useMemo(
    () => deriveGlobalError({ isPaused, notifications }),
    [isPaused, notifications],
  );

  return {
    notifications,
    isLoading,
    isError,
    isFetching,
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
