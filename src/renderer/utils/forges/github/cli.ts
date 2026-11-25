import type {
  GitHubCliAccountsError,
  GitHubCliIdentity,
  GitHubCliTokenError,
} from '../../../../shared/events';

import type { Hostname, Token } from '../../../types';
import type { CliAccountsError, CliAccountsResult } from '../types';

import { listGitHubCliAccounts as readCliAccounts, readGitHubCliToken } from '../../system/comms';

/**
 * Concurrent CLI reads share one promise per host and identity. Settled reads
 * are removed so the next request observes credential changes in the CLI.
 */
const cliTokens = new Map<string, Promise<Token>>();

const ACCOUNTS_ERROR: Record<GitHubCliAccountsError, CliAccountsError> = {
  GH_NOT_FOUND: 'CLI_NOT_FOUND',
  GH_NOT_AUTHENTICATED: 'CLI_NOT_AUTHENTICATED',
  GH_ACCOUNTS_UNSUPPORTED: 'CLI_UNSUPPORTED',
  GH_TIMED_OUT: 'CLI_TIMED_OUT',
  GH_FAILED: 'CLI_FAILED',
};

/**
 * Resolve the GitHub CLI token for `hostname`, optionally for a specific
 * identity. Resolving by identity reads that account's credential without
 * changing which account the CLI treats as active.
 *
 * @param hostname - Host to resolve the token for.
 * @param identity - Identity to address; omitted for the CLI's active account.
 * @returns The token the CLI holds for that host and identity.
 * @throws If the CLI is missing, not logged in, or failed.
 */
export function resolveGitHubCliToken(
  hostname: Hostname,
  identity?: GitHubCliIdentity,
): Promise<Token> {
  const key = cacheKey(hostname, identity);
  const inFlight = cliTokens.get(key);
  if (inFlight) {
    return inFlight;
  }

  const read = readCliToken(hostname, identity).finally(() => {
    if (cliTokens.get(key) === read) {
      cliTokens.delete(key);
    }
  });
  cliTokens.set(key, read);

  return read;
}

/**
 * Forget the cached credential for one host and identity, so the next request
 * re-reads the CLI.
 */
export function forgetGitHubCliToken(hostname: Hostname, identity?: GitHubCliIdentity): void {
  cliTokens.delete(cacheKey(hostname, identity));
}

/**
 * Forget every cached credential for a host, across all identities. Used when
 * an account's credential changes or the account is removed.
 */
export function forgetGitHubCliTokens(hostname: Hostname): void {
  const prefix = `${hostname}\0`;
  for (const key of cliTokens.keys()) {
    if (key.startsWith(prefix)) {
      cliTokens.delete(key);
    }
  }
}

/**
 * List the identities the GitHub CLI holds for `hostname`.
 *
 * @param hostname - Host to list identities for.
 * @returns The usable identities, or a classified failure.
 */
export async function listGitHubCliAccounts(hostname: Hostname): Promise<CliAccountsResult> {
  const result = await readCliAccounts(hostname);

  if (result.error) {
    return { error: ACCOUNTS_ERROR[result.error], detail: result.detail };
  }

  return { accounts: result.accounts };
}

/**
 * Map a resolved GitHub login onto one of the host's CLI identities. A stored
 * account wins over the environment credential; when the login matches
 * neither, no identity is recorded and the account keeps using the active one.
 */
export async function identifyGitHubCliIdentity(
  hostname: Hostname,
  login: string,
): Promise<GitHubCliIdentity | undefined> {
  const result = await listGitHubCliAccounts(hostname);

  if (result.error) {
    return undefined;
  }

  const normalized = login.toLowerCase();
  const stored = result.accounts.find(
    (account) =>
      account.identity.kind === 'account' && account.identity.login.toLowerCase() === normalized,
  );

  if (stored) {
    return stored.identity;
  }

  return result.accounts.find((account) => account.identity.kind === 'environment')?.identity;
}

async function readCliToken(hostname: Hostname, identity?: GitHubCliIdentity): Promise<Token> {
  const result = await readGitHubCliToken({ hostname, identity });

  if (result.error) {
    throw new Error(describeFailure(result.error, result.detail, hostname, identity));
  }

  return result.token as Token;
}

function cacheKey(hostname: Hostname, identity?: GitHubCliIdentity): string {
  return `${hostname}\0${identityKey(identity)}`;
}

function identityKey(identity?: GitHubCliIdentity): string {
  if (!identity) {
    return 'active';
  }

  return identity.kind === 'account' ? `account:${identity.login.toLowerCase()}` : 'environment';
}

function describeFailure(
  error: GitHubCliTokenError,
  detail: string | undefined,
  hostname: Hostname,
  identity?: GitHubCliIdentity,
): string {
  switch (error) {
    case 'GH_NOT_FOUND':
      return 'GitHub CLI (gh) was not found. Install it from https://cli.github.com, log in, and try again.';
    case 'GH_NOT_AUTHENTICATED':
      return identity?.kind === 'account'
        ? `GitHub CLI has no token for ${hostname} account ${identity.login}. Run \`gh auth login --hostname ${hostname}\` and try again.`
        : `GitHub CLI has no token for ${hostname}. Run \`gh auth login --hostname ${hostname}\` and try again.`;
    case 'GH_TIMED_OUT':
      return `GitHub CLI did not respond within 10 seconds for ${hostname}. It may be waiting on a keychain prompt.`;
    default:
      return detail
        ? `GitHub CLI could not provide a token for ${hostname}: ${detail}`
        : `GitHub CLI could not provide a token for ${hostname}.`;
  }
}
