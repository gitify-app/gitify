import type { GitHubCliTokenError } from '../../../../shared/events';

import type { Hostname, Token } from '../../../types';

import { readGitHubCliToken } from '../../system/comms';

/**
 * In-flight and resolved CLI reads, per host.
 *
 * The CLI keychain is the source of truth for `GitHub CLI` accounts — nothing
 * here is persisted. Reading it spawns a process and touches the OS keychain,
 * so the promise is shared: concurrent requests collapse onto one read, and a
 * resolved token is reused until it is forgotten.
 */
const cliTokens = new Map<Hostname, Promise<Token>>();

/**
 * Resolve the GitHub CLI token for `hostname`.
 *
 * @param hostname - Host to resolve the token for.
 * @returns The token the CLI holds for that host.
 * @throws If the CLI is missing, not logged in to the host, or failed.
 */
export function resolveGitHubCliToken(hostname: Hostname): Promise<Token> {
  const inFlight = cliTokens.get(hostname);
  if (inFlight) {
    return inFlight;
  }

  const read = readCliToken(hostname);
  cliTokens.set(hostname, read);

  return read.catch((err) => {
    cliTokens.delete(hostname);
    throw err;
  });
}

export function forgetGitHubCliToken(hostname: Hostname): void {
  cliTokens.delete(hostname);
}

async function readCliToken(hostname: Hostname): Promise<Token> {
  const result = await readGitHubCliToken(hostname);

  if (result.error) {
    throw new Error(describeFailure(result.error, result.detail, hostname));
  }

  return result.token as Token;
}

function describeFailure(
  error: GitHubCliTokenError,
  detail: string | undefined,
  hostname: Hostname,
): string {
  switch (error) {
    case 'GH_NOT_FOUND':
      return 'GitHub CLI (gh) was not found. Install it from https://cli.github.com, log in, and try again.';
    case 'GH_NOT_AUTHENTICATED':
      return `GitHub CLI has no token for ${hostname}. Run \`gh auth login --hostname ${hostname}\` and try again.`;
    case 'GH_TIMED_OUT':
      return `GitHub CLI did not respond within 10 seconds for ${hostname}. It may be waiting on a keychain prompt.`;
    default:
      return detail
        ? `GitHub CLI could not provide a token for ${hostname}: ${detail}`
        : `GitHub CLI could not provide a token for ${hostname}.`;
  }
}
