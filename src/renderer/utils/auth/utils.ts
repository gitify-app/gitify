import type { Account, Link } from '../../types';

import { rendererLogError, rendererLogWarn, toError } from '../core/logger';
import { getAccountAdapter } from '../forges/registry';
import { hasRequiredScopes } from './scopes';

export { getAccountUUID, isValidHostname } from './identity';

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
    const refreshed = await getAccountAdapter(account).fetchAuthenticatedUser();

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
