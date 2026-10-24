import type { Account, AccountNotifications, GitifyNotification, GroupBy } from '../../types';

import { getAccountUUID } from '../auth/utils';
import { getNotificationItemKey, type ListItem } from './listItems';

/** Approximate height of the tallest sticky group header, in pixels. */
export const STICKY_HEADER_HEIGHT = 40;

/** Gap between the sticky header and a focused row. */
export const FOCUS_GAP = 8;

/** Distance from the viewport top used when focusing a row below the header. */
export const FOCUS_VIEW_OFFSET = STICKY_HEADER_HEIGHT + FOCUS_GAP;

/** How long a focused row stays highlighted. */
export const FOCUS_HIGHLIGHT_MS = 2000;

/**
 * Return the item indices that should be sticky for the current flattened
 * sequence. Repository headers win when repository grouping is active;
 * account headers are used only when the next item is not a repository
 * header. This keeps at most one header pinned at a time.
 */
export function getStickyHeaderIndices(items: readonly ListItem[]): number[] {
  const indices: number[] = [];

  for (const [index, item] of items.entries()) {
    if (item.kind === 'repository') {
      indices.push(index);
      continue;
    }

    if (item.kind === 'account') {
      const next = items[index + 1];

      if (next?.kind !== 'repository') {
        indices.push(index);
      }
    }
  }

  return indices;
}

/**
 * Return the index of a notification row in the flattened sequence, or `-1`.
 * Uses the same stable key as the list so identical forge IDs in different
 * accounts cannot match the wrong row.
 */
export function getNotificationItemIndex(
  items: readonly ListItem[],
  accountUUID: string,
  notificationId: string,
): number {
  const key = getNotificationItemKey(accountUUID, notificationId);

  return items.findIndex((item) => item.kind === 'notification' && item.key === key);
}

/** Find a notification in the filtered account data for a specific account. */
export function findNotificationFocusTarget(
  accountNotifications: readonly AccountNotifications[],
  accountUUID: string,
  notificationId: string,
): GitifyNotification | null {
  for (const entry of accountNotifications) {
    if (getAccountUUID(entry.account) !== accountUUID) {
      continue;
    }

    const notification = entry.notifications.find((candidate) => candidate.id === notificationId);

    if (notification) {
      return notification;
    }
  }

  return null;
}

export type NotificationFocusResolution =
  | { status: 'found'; notification: GitifyNotification; index: number }
  | { status: 'filtered-out' }
  | { status: 'missing'; notification: GitifyNotification }
  | { status: 'collapsed-account'; notification: GitifyNotification }
  | { status: 'collapsed-repository'; notification: GitifyNotification; repoKey: string };

/**
 * Resolve a focus request against the filtered account data and the flattened
 * list. The result distinguishes a notification that is absent (filtered out)
 * from one that is present but hidden by a collapsed group.
 */
export function resolveNotificationFocus({
  accountNotifications,
  items,
  accountUUID,
  notificationId,
  collapsedAccounts,
  collapsedRepositories,
}: {
  accountNotifications: readonly AccountNotifications[];
  items: readonly ListItem[];
  accountUUID: string;
  notificationId: string;
  collapsedAccounts: ReadonlySet<string>;
  collapsedRepositories: ReadonlySet<string>;
}): NotificationFocusResolution {
  const notification = findNotificationFocusTarget(
    accountNotifications,
    accountUUID,
    notificationId,
  );

  if (!notification) {
    return { status: 'filtered-out' };
  }

  const index = getNotificationItemIndex(items, accountUUID, notificationId);

  if (index >= 0) {
    return { status: 'found', notification, index };
  }

  if (collapsedAccounts.has(accountUUID)) {
    return { status: 'collapsed-account', notification };
  }

  const repoKey = `${accountUUID}-${notification.repository.fullName}`;

  if (collapsedRepositories.has(repoKey)) {
    return { status: 'collapsed-repository', notification, repoKey };
  }

  return { status: 'missing', notification };
}

export interface NotificationListFilters {
  includeSearchTokens: readonly string[];
  excludeSearchTokens: readonly string[];
  accounts: readonly string[];
  userTypes: readonly string[];
  subjectTypes: readonly string[];
  states: readonly string[];
  reasons: readonly string[];
  reviewRequestTypes: readonly string[];
}

export interface NotificationListDataKeyInput {
  groupBy: GroupBy;
  accounts: readonly Account[];
  filters: NotificationListFilters;
}

/**
 * Build the identity of the current logical dataset. Notification content and
 * counts are deliberately absent so a poll of the same accounts, filters, and
 * grouping keeps the scroll anchor.
 */
export function getNotificationListDataKey({
  groupBy,
  accounts,
  filters,
}: NotificationListDataKeyInput): string {
  const filterValues = [
    filters.includeSearchTokens,
    filters.excludeSearchTokens,
    filters.accounts,
    filters.userTypes,
    filters.subjectTypes,
    filters.states,
    filters.reasons,
    filters.reviewRequestTypes,
  ].map((values) => [...values].sort((a, b) => a.localeCompare(b)));

  return JSON.stringify([
    groupBy,
    accounts.map(getAccountUUID).sort((a, b) => a.localeCompare(b)),
    ...filterValues,
  ]);
}
