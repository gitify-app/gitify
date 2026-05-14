import { Constants } from '../../constants';

import type { Account, AccountUUID, AuthState, Forge, Hostname, Link, Token } from '../../types';
import type { AuthMethod } from './types';

import { rendererLogError, rendererLogInfo, rendererLogWarn, toError } from '../core/logger';
import { getAdapter } from '../forges/registry';
import { encryptValue } from '../system/comms';
import { resolvePlatform } from './platform';
import { hasRequiredScopes } from './scopes';

/**
 * Add or update an account in the auth state.
 *
 * Encrypts the token, refreshes the user profile, then upserts the account:
 * if an account with the same UUID (hostname + user ID + method) already
 * exists it is replaced (e.g. on re-authentication); otherwise it is appended.
 *
 * @param auth - The current auth state.
 * @param method - The authentication method used.
 * @param token - The plaintext access token to store (will be encrypted).
 * @param hostname - The forge hostname for the account.
 * @returns The updated auth state.
 */
export async function addAccount(
  auth: AuthState,
  method: AuthMethod,
  token: Token,
  hostname: Hostname,
  forge: Forge = 'github',
  username?: string,
): Promise<AuthState> {
  const accountList = auth.accounts;
  const encryptedToken = await encryptValue(token);

  let newAccount = {
    forge,
    hostname: hostname,
    method: method,
    platform: resolvePlatform(forge, hostname),
    token: encryptedToken,
    username: username ?? undefined,
    user: null, // Will be updated during the refresh call below
  } as Account;

  newAccount = await refreshAccount(newAccount);
  const newAccountUUID = getAccountUUID(newAccount);

  const existingIndex = accountList.findIndex((a) => getAccountUUID(a) === newAccountUUID);

  if (existingIndex >= 0) {
    // Drop any forge-specific HTTP client cache so the new token is used.
    getAdapter(accountList[existingIndex]).onAccountTokenChange?.(accountList[existingIndex]);
    // Replace the existing account (e.g. re-authentication with a new token)
    rendererLogInfo('addAccount', `updating existing account for user ${newAccount.user?.login}`);
    accountList[existingIndex] = newAccount;
  } else {
    accountList.push(newAccount);
  }

  return {
    accounts: accountList,
  };
}

/**
 * Remove an account from the auth state.
 *
 * @param auth - The current auth state.
 * @param account - The account to remove.
 * @returns A new auth state with the account removed.
 */
export function removeAccount(auth: AuthState, account: Account): AuthState {
  const updatedAccounts = auth.accounts.filter((a) => a.token !== account.token);

  return {
    accounts: updatedAccounts,
  };
}

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

/**
 * Return the primary (first) account hostname, or the default GitHub.com hostname
 * if no accounts are present.
 *
 * @param auth - The current auth state.
 * @returns The hostname of the first account.
 */
export function getPrimaryAccountHostname(auth: AuthState) {
  return auth.accounts[0]?.hostname ?? Constants.GITHUB_HOSTNAME;
}

/**
 * Return true if at least one account is authenticated.
 *
 * @param auth - The current auth state.
 */
export function hasAccounts(auth: AuthState) {
  return auth.accounts.length > 0;
}

/**
 * Return true if more than one account is authenticated.
 *
 * @param auth - The current auth state.
 */
export function hasMultipleAccounts(auth: AuthState) {
  return auth.accounts.length > 1;
}
