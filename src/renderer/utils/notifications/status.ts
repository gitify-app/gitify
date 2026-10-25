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
  /** The initial fetch has not settled yet. */
  isLoading: boolean;
  /** TanStack Query paused the request (e.g. offline). */
  isPaused: boolean;
  /** The query failed outright. */
  isError: boolean;
  /** Per-account notification groups, each carrying its own error (or null). */
  notifications: AccountNotifications[];
}

/**
 * Derive the overall notifications status.
 *
 * Only the initial fetch (no settled success or error yet) reports `loading` -
 * background refetches of already-settled data keep their settled status.
 */
export function deriveStatus({
  isLoading,
  isPaused,
  isError,
  notifications,
}: NotificationStatusInput): Status {
  if (isLoading) {
    return 'loading';
  }

  // Paused (offline) and outright query errors both surface as error status.
  if (isPaused || isError) {
    return 'error';
  }

  // All accounts failing is a total outage.
  if (doesAllAccountsHaveErrors(notifications)) {
    return 'error';
  }

  return 'success';
}

/**
 * Derive the single global error to show, if one applies.
 *
 * A global error is only shown when every account failed with the *same*
 * error. When accounts fail with different errors (a partial failure), status
 * is `error` but no single global error is shown - the per-account rows carry
 * their own errors.
 */
export function deriveGlobalError({
  isPaused,
  notifications,
}: Pick<NotificationStatusInput, 'isPaused' | 'notifications'>): GitifyError | undefined {
  if (isPaused) {
    return getErrorDetails('OFFLINE');
  }

  if (notifications.length === 0) {
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
