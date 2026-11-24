import type { GitHubCliIdentity } from '../../../shared/events';
import { isValidGitHubCliLogin } from '../../../shared/githubCli';

import type { Account, AccountUUID } from '../../types';

/**
 * Validate a CLI identity loaded from persisted state.
 *
 * Persisted JSON is untrusted, and a login reaches `gh` arguments through the
 * bridge, so unknown kinds and malformed logins are dropped rather than kept.
 *
 * @param value - Candidate identity from persisted account state.
 * @returns The identity when it is well formed, otherwise `undefined`.
 */
export function sanitizeCliIdentity(value: unknown): GitHubCliIdentity | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const candidate = value as { kind?: unknown; login?: unknown };

  if (candidate.kind === 'environment') {
    return { kind: 'environment' };
  }

  if (candidate.kind === 'account' && isValidGitHubCliLogin(candidate.login)) {
    return { kind: 'account', login: candidate.login };
  }

  return undefined;
}

/**
 * Return true if `hostname` is a valid DNS hostname (e.g. `github.com`).
 * Accepts hostnames with 2-6 character TLDs; rejects IP addresses and bare labels.
 *
 * @param hostname - The hostname string to validate.
 * @returns `true` if valid.
 */
export function isValidHostname(hostname: string) {
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
