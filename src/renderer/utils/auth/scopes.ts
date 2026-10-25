import type { Account } from '../../types';
import type { ExternallyManagedScopes } from '../forges/types';

import { getAccountAdapter } from '../forges/registry';

export {
  formatAlternateOAuthScopes,
  formatRecommendedOAuthScopes,
  formatRequiredOAuthScopes,
  getAlternateScopeNames,
  getRecommendedScopeNames,
  getRequiredScopeNames,
} from './scopeNames';

/**
 * Return true if the account has all required OAuth scopes.
 *
 * Scope semantics live on the forge adapter — forges without an OAuth scope
 * concept (e.g. Gitea) omit `oauthScopes`, and every check resolves to `true`.
 *
 * @param account - The account whose scopes to check.
 */
export function hasRequiredScopes(account: Account): boolean {
  return getAccountAdapter(account).oauthScopes?.hasRequired() ?? true;
}

/**
 * Return true if the account has all recommended OAuth scopes.
 *
 * @param account - The account whose scopes to check.
 */
export function hasRecommendedScopes(account: Account): boolean {
  return getAccountAdapter(account).oauthScopes?.hasRecommended() ?? true;
}

/**
 * Return true if the account has all alternate OAuth scopes.
 *
 * @param account - The account whose scopes to check.
 */
export function hasAlternateScopes(account: Account): boolean {
  return getAccountAdapter(account).oauthScopes?.hasAlternate() ?? true;
}

/**
 * Return how to explain the account's scopes when another tool owns the
 * credential, or `undefined` when Gitify can change them itself.
 *
 * @param account - The account whose scopes to describe.
 */
export function externallyManagedScopes(account: Account): ExternallyManagedScopes | undefined {
  return getAccountAdapter(account).oauthScopes?.externallyManaged();
}
