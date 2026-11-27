import type { AccountNotifications, ConnectionState, ErrorType } from '../../types';

import { doesAllAccountsHaveErrors } from '../core/errors';

/**
 * Error classifications that retrying cannot resolve: they need the user to
 * change credentials, scopes, or wait out a rate limit.
 */
const DEFINITIVE_ERROR_TYPES: ReadonlySet<ErrorType> = new Set([
  'ACTION_FORBIDDEN',
  'BAD_CREDENTIALS',
  'MISSING_SCOPES',
  'RATE_LIMITED',
]);

/**
 * Whether at least one account settled without an error.
 *
 * A single reachable account is enough to treat the connection as online, even
 * when other accounts still fail (partial failure).
 */
export function hasCleanAccount(notifications: AccountNotifications[]): boolean {
  return notifications.some((accountNotifications) => accountNotifications.error === null);
}

/**
 * Whether a settled all-account failure is likely a connectivity problem worth
 * retrying during recovery.
 *
 * Only GitHub transport failures classify as `NETWORK`; other forges and some
 * transport errors fall through to `UNKNOWN`. Treating `UNKNOWN` as retryable
 * keeps recovery forge-neutral, while definitive errors (auth, scope, rate
 * limit, forbidden) end recovery immediately.
 */
export function isRetryableConnectionError(notifications: AccountNotifications[]): boolean {
  return (
    doesAllAccountsHaveErrors(notifications) &&
    !notifications.some((accountNotifications) => {
      const errorType = accountNotifications.error?.type;
      return errorType !== undefined && DEFINITIVE_ERROR_TYPES.has(errorType);
    })
  );
}

/**
 * Whether the next notification fetch should use the short recovery retry
 * cadence: only while recovering and the latest settled fetch was a retryable
 * connection failure. A clean, partial, or definitive outcome returns to the
 * normal user/server interval.
 */
export function shouldUseRecoveryRetry(
  connectionState: ConnectionState,
  notifications: AccountNotifications[],
): boolean {
  return connectionState === 'recovering' && isRetryableConnectionError(notifications);
}
