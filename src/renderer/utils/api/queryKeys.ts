import type { AccountUUID } from '../../types';

/**
 * Centralized query key factory for TanStack Query.
 * This ensures consistent query keys across the application and makes
 * invalidation and cache management easier.
 *
 * Following TanStack Query best practices:
 * https://tanstack.com/query/latest/docs/framework/react/community/lukemorales-query-key-factory
 */

/**
 * Query keys for notifications
 */
export const notificationsKeys = {
  /**
   * Base key for all notification queries
   */
  all: ['notifications'] as const,

  /**
   * Key for listing notifications with specific parameters.
   *
   * Keyed by account identities (not count) so adding, removing, or swapping
   * accounts always resolves to a distinct cache entry.
   *
   * @param accountUUIDs - The UUIDs of all accounts being fetched
   * @param fetchReadNotifications - Whether to fetch only unread notifications
   * @param participating - Whether to fetch only participating notifications
   */
  list: (accountUUIDs: AccountUUID[], fetchReadNotifications: boolean, participating: boolean) =>
    [...notificationsKeys.all, accountUUIDs, fetchReadNotifications, participating] as const,
};

/**
 * Query keys for accounts
 */
export const accountsKeys = {
  /**
   * Base key for all account queries
   */
  all: ['accounts'] as const,

  /**
   * Key for refreshing account details
   * @param accountUUIDs - The UUIDs of all accounts being refreshed
   */
  refresh: (accountUUIDs: AccountUUID[]) => [...accountsKeys.all, accountUUIDs] as const,
};
