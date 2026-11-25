import type { AccountNotifications, GitifyError, Status } from '../../types';

import {
  areAllAccountErrorsSame,
  doesAllAccountsHaveErrors,
  getErrorDetails,
} from '../core/errors';

/**
 * Inputs that determine the notification status and global error.
 *
 * Kept as a plain shape so the derivation is pure and testable without React
 * or the query layer.
 */
export interface NotificationStatusInput {
  isNetworkOnline: boolean;
  /** The initial fetch is in progress. */
  isLoading: boolean;
  /** Neither success nor error has settled yet. */
  isPending: boolean;
  /** The query is waiting for connectivity or for the window to become visible. */
  isPaused: boolean;
  /** The previous result predates reconnection; a fresh result is still due. */
  isRecovering: boolean;
  /** The query failed outright. */
  isError: boolean;
  /** Per-account notification groups, each carrying its own error (or null). */
  notifications: AccountNotifications[];
}

/**
 * Derive the overall notifications status.
 *
 * Keep settled status during normal background refetches. During reconnect,
 * don't report cached failures while waiting for the new fetch to settle.
 */
export function deriveStatus({
  isNetworkOnline,
  isLoading,
  isPending,
  isPaused,
  isRecovering,
  isError,
  notifications,
}: NotificationStatusInput): Status {
  if (!isNetworkOnline) {
    return 'offline';
  }

  const hasError = isError || doesAllAccountsHaveErrors(notifications);

  if (isPaused) {
    return isPending || hasError ? 'paused' : 'success';
  }

  if (isLoading || (isRecovering && hasError)) {
    return 'loading';
  }

  return hasError ? 'error' : 'success';
}

/**
 * Derive the single global error to show, if one applies.
 *
 * Aside from being offline, there is only a shared error when every account
 * failed with the same error. Suppress stale errors while reconnecting.
 */
export function deriveGlobalError({
  status,
  notifications,
}: {
  status: Status;
  notifications: AccountNotifications[];
}): GitifyError | undefined {
  if (status === 'offline') {
    return getErrorDetails('OFFLINE');
  }

  if (status !== 'error' || notifications.length === 0) {
    return undefined;
  }

  if (doesAllAccountsHaveErrors(notifications) && areAllAccountErrorsSame(notifications)) {
    return notifications[0].error ?? undefined;
  }

  return undefined;
}

/**
 * Whether every account notification is free of errors.
 *
 * This is deliberately distinct from `doesAllAccountsHaveErrors`: the two are
 * complements for zero or entirely-failing accounts, but differ under partial
 * failure, where some accounts have an error and others do not.
 */
export function hasNoAccountErrors(accountNotifications: AccountNotifications[]): boolean {
  return accountNotifications.every((account) => account.error === null);
}
