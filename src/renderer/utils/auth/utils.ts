import type { Account, AccountUUID, Hostname, Link } from '../../types';

import { rendererLogError, rendererLogWarn, toError } from '../core/logger';
import { getAdapter } from '../forges/registry';
import { hasRequiredScopes } from './scopes';

/**
 * Refresh an account's user profile, version, and OAuth scopes from the API.
 *
 * Mutates the `account` object in-place and returns it.
 * Re-throws any error encountered so callers can handle auth failures.
 *
 * @param account - The account to refresh.
 * @returns The same account object with updated user, version, and scopes.
 * @throws If the API call fails.
 */
export async function refreshAccount(account: Account): Promise<Account> {
  try {
    const refreshed = await getAdapter(account).fetchAuthenticatedUser(account);

    account.user = {
      id: refreshed.user.id,
      login: refreshed.user.login,
      name: refreshed.user.name,
      avatar: refreshed.user.avatar as Link,
    };
    account.version = refreshed.version;
    account.scopes = refreshed.scopes ?? [];

    if (!hasRequiredScopes(account)) {
      rendererLogWarn(
        'refreshAccount',
        `account for user ${account.user.login} is missing required scopes`,
      );
    }
  } catch (err) {
    rendererLogError(
      'refreshAccount',
      `failed to refresh account for user ${account.user?.login ?? account.hostname}`,
      toError(err),
    );
    throw err;
  }

  return account;
}

/**
 * Return true if `hostname` is a valid DNS hostname (e.g. `github.com`).
 * Accepts hostnames with 2-6 character TLDs; rejects IP addresses and bare labels.
 *
 * @param hostname - The hostname string to validate.
 * @returns `true` if valid.
 */
export function isValidHostname(hostname: Hostname) {
  return /^([A-Z0-9]([A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}$/i.test(hostname);
}

/**
 * Derive a stable, unique identifier for an account.
 *
 * Encodes `"<hostname>-<userId>-<method>"` as a base-64 string so the UUID
 * is safe for use as a cache key or map key.
 *
 * @param account - The account to identify.
 * @returns A base-64 encoded UUID string.
 */
export function getAccountUUID(account: Account): AccountUUID {
  return btoa(`${account.hostname}-${account.user?.id}-${account.method}`) as AccountUUID;
}
