import { Constants } from '../../constants';

import type { Account } from '../../types';

import { isForgeGitea } from './forge';

/**
 * Return true if the account has all required OAuth scopes.
 *
 * @param account - The account whose scopes to check.
 */
export function hasRequiredScopes(account: Account): boolean {
  if (isForgeGitea(account.forge)) {
    return true;
  }
  return Constants.OAUTH_SCOPES.REQUIRED.every(({ name }) =>
    (account.scopes ?? []).includes(name),
  );
}

/**
 * Return true if the account has all recommended OAuth scopes.
 *
 * @param account - The account whose scopes to check.
 */
export function hasRecommendedScopes(account: Account): boolean {
  return Constants.OAUTH_SCOPES.RECOMMENDED.every(({ name }) =>
    (account.scopes ?? []).includes(name),
  );
}

/**
 * Return true if the account has all alternate OAuth scopes.
 *
 * @param account - The account whose scopes to check.
 */
export function hasAlternateScopes(account: Account): boolean {
  return Constants.OAUTH_SCOPES.ALTERNATE.every(({ name }) =>
    (account.scopes ?? []).includes(name),
  );
}

/**
 * Return the list of required OAuth scope names.
 *
 * @returns Array of required scope name strings.
 */
export function getRequiredScopeNames(): string[] {
  return Constants.OAUTH_SCOPES.REQUIRED.map(({ name }) => name);
}

/**
 * Return the list of recommended OAuth scope names.
 *
 * @returns Array of recommended scope name strings.
 */
export function getRecommendedScopeNames(): string[] {
  return Constants.OAUTH_SCOPES.RECOMMENDED.map(({ name }) => name);
}

/**
 * Return the list of alternate OAuth scope names.
 *
 * @returns Array of alternate scope name strings.
 */
export function getAlternateScopeNames(): string[] {
  return Constants.OAUTH_SCOPES.ALTERNATE.map(({ name }) => name);
}

/**
 * Return the required OAuth scopes as a comma-separated string.
 *
 * @returns Comma-separated required scope names.
 */
export function formatRequiredOAuthScopes(): string {
  return getRequiredScopeNames().join(', ');
}

/**
 * Return the recommended OAuth scopes as a comma-separated string.
 *
 * @returns Comma-separated recommended scope names.
 */
export function formatRecommendedOAuthScopes(): string {
  return getRecommendedScopeNames().join(', ');
}

/**
 * Return the alternate OAuth scopes as a comma-separated string.
 *
 * @returns Comma-separated alternate scope names.
 */
export function formatAlternateOAuthScopes(): string {
  return getAlternateScopeNames().join(', ');
}
