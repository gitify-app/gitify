import type { Account } from '../../types';

/**
 * Last server-recommended minimum poll interval in seconds, per account.
 *
 * GitHub returns an `X-Poll-Interval` header on the notifications list
 * endpoint indicating how frequently clients may poll it (usually 60 seconds,
 * raised when the server wants clients to back off). Forge clients report the
 * header value here after each list fetch and the notifications query reads it
 * back to stretch its polling interval accordingly.
 *
 * @see https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api
 */
const serverPollIntervalsSeconds = new Map<string, number>();

/**
 * Stable per-account key, derived from the same identity fields as
 * `getAccountUUID`. Kept local so this leaf module does not import the
 * auth/forge module graph (which would create an import cycle back through
 * the forge clients); the key only needs to be consistent within this
 * registry.
 */
function accountKey(account: Account): string {
  return `${account.hostname}-${account.user?.id}-${account.method}`;
}

/**
 * Record the server-recommended minimum poll interval for an account.
 * Non-finite or non-positive values are ignored, so forges without the header
 * simply never report.
 */
export function reportServerPollInterval(account: Account, seconds: number): void {
  if (Number.isFinite(seconds) && seconds > 0) {
    serverPollIntervalsSeconds.set(accountKey(account), seconds);
  }
}

/**
 * Compute the effective notifications polling interval: the user-configured
 * interval, stretched to the slowest server-recommended interval across the
 * given accounts so polling never runs faster than a forge allows.
 *
 * @param userIntervalMs - The user-configured fetch interval in milliseconds.
 * @param accounts - The accounts currently being polled.
 * @returns The polling interval to use, in milliseconds.
 */
export function computeRefetchIntervalMs(userIntervalMs: number, accounts: Account[]): number {
  const serverIntervalsMs = accounts.map(
    (account) => (serverPollIntervalsSeconds.get(accountKey(account)) ?? 0) * 1000,
  );

  return Math.max(userIntervalMs, ...serverIntervalsMs);
}

/**
 * Clear all reported poll intervals. Intended for use in tests to keep the
 * module-level state from leaking across cases.
 */
export function clearServerPollIntervals(): void {
  serverPollIntervalsSeconds.clear();
}
