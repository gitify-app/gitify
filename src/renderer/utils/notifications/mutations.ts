import type { QueryKey } from '@tanstack/react-query';

import type { AccountNotifications, GitifyError, GitifyNotification } from '../../types';

import { determineFailureType } from '../api/errors';
import { getAccountUUID } from '../auth/utils';
import { toError } from '../core/logger';

/**
 * The classified outcome of a single notification's failed action request
 * within a bulk/group mutation.
 */
export interface FailedNotificationAction {
  notification: GitifyNotification;
  error: GitifyError;
  rawError: Error;
}

/**
 * The per-notification outcome of a bulk/group mutation: which notifications
 * succeeded, and which failed (with their classified error).
 */
export interface SettledNotificationActions {
  succeeded: GitifyNotification[];
  failed: FailedNotificationAction[];
}

/**
 * A query key paired with its snapshotted `AccountNotifications[]` data, as
 * returned by `queryClient.getQueriesData`.
 */
export type NotificationQuerySnapshot = [QueryKey, AccountNotifications[] | undefined][];

/**
 * Run an action against each notification independently via
 * `Promise.allSettled`, so one failing notification doesn't obscure the
 * outcome of the rest of a bulk/group action.
 *
 * @param notifications The notifications to execute the action against.
 * @param action The per-notification async action to execute.
 * @returns The notifications that succeeded, and the notifications that
 * failed alongside their classified error.
 */
export async function settleNotificationActions(
  notifications: GitifyNotification[],
  action: (notification: GitifyNotification) => Promise<unknown>,
): Promise<SettledNotificationActions> {
  const results = await Promise.allSettled(
    notifications.map((notification) => action(notification)),
  );

  const succeeded: GitifyNotification[] = [];
  const failed: FailedNotificationAction[] = [];

  results.forEach((result, index) => {
    const notification = notifications[index];

    if (result.status === 'fulfilled') {
      succeeded.push(notification);
      return;
    }

    const rawError = toError(result.reason);
    failed.push({
      notification,
      error: determineFailureType(rawError),
      rawError,
    });
  });

  return { succeeded, failed };
}

/**
 * Restore notifications that failed their action back into a query's cached
 * data, using a pre-mutation snapshot as the source of truth for their
 * original data (e.g. `unread` state, ordering). Notifications that
 * succeeded or were otherwise already absent from `current` are left as-is.
 *
 * Cache changes for these mutations are applied in `onSuccess` (not
 * optimistically), so in practice failed notifications are rarely absent
 * from `current` to begin with - this exists as a defensive guard for any
 * concurrent cache change that removed them in the meantime.
 *
 * @param failedNotifications The notifications whose action failed and should be present.
 * @param snapshot The pre-mutation snapshot of `AccountNotifications[]` to restore from.
 * @param current The current `AccountNotifications[]`.
 * @returns A new `AccountNotifications[]` with failed notifications present.
 */
export function restoreFailedNotifications(
  failedNotifications: GitifyNotification[],
  snapshot: AccountNotifications[],
  current: AccountNotifications[],
): AccountNotifications[] {
  if (failedNotifications.length === 0) {
    return current;
  }

  const failedIdsByAccount = new Map<string, Set<string>>();
  for (const notification of failedNotifications) {
    const accountKey = getAccountUUID(notification.account);
    if (!failedIdsByAccount.has(accountKey)) {
      failedIdsByAccount.set(accountKey, new Set());
    }
    failedIdsByAccount.get(accountKey)?.add(notification.id);
  }

  return current.map((accountEntry) => {
    const accountKey = getAccountUUID(accountEntry.account);
    const failedIds = failedIdsByAccount.get(accountKey);

    if (!failedIds) {
      return accountEntry;
    }

    const snapshotEntry = snapshot.find((entry) => getAccountUUID(entry.account) === accountKey);

    if (!snapshotEntry) {
      return accountEntry;
    }

    const currentIds = new Set(accountEntry.notifications.map((notification) => notification.id));

    const missingNotifications = snapshotEntry.notifications.filter(
      (notification) => failedIds.has(notification.id) && !currentIds.has(notification.id),
    );

    if (missingNotifications.length === 0) {
      return accountEntry;
    }

    return {
      ...accountEntry,
      notifications: [...accountEntry.notifications, ...missingNotifications],
    };
  });
}
