import semver from 'semver';

import type { Account } from '../../../types';
import type { ForgeCapabilities } from '../types';

import { isGitHubCloudHost, isGitHubEnterpriseServerHost } from './platform';

/**
 * GitHub feature capabilities exposed through the forge adapter contract.
 *
 * GitHub Cloud and GitHub Enterprise Cloud with Data Residency support
 * everything; GitHub Enterprise Server gates certain features behind a
 * minimum version.
 */
export const githubCapabilities: ForgeCapabilities = {
  markAsDone(account: Account): boolean {
    if (!isGitHubEnterpriseServerHost(account.hostname)) {
      return true;
    }
    if (account.version) {
      return semver.gte(account.version, '3.13.0');
    }
    return false;
  },
  unsubscribeThread(): boolean {
    return true;
  },
};

/**
 * GitHub-only capability: whether the GraphQL discussion schema exposes the
 * `isAnswered` field. Lives outside the shared `ForgeCapabilities` because no
 * other forge has an "answered discussion" concept and the only consumer is
 * the GitHub GraphQL query construction in `client.ts`.
 *
 * GHES exposed `isAnswered` from version 3.12 onwards.
 */
export function supportsAnsweredDiscussion(account: Account): boolean {
  if (!isGitHubEnterpriseServerHost(account.hostname)) {
    return true;
  }
  if (account.version) {
    return semver.gte(account.version, '3.12.0');
  }
  return false;
}

/**
 * GitHub-only capability: whether the GraphQL `PullRequest` schema exposes the
 * native `stackEntry` field used for stacked PR metrics. Lives outside the
 * shared `ForgeCapabilities` because no other forge supports stacked PRs and
 * the only consumer is the GitHub GraphQL query construction in `client.ts`.
 *
 * Stacked PRs are a GitHub Cloud feature and are not available on GitHub
 * Enterprise Server.
 */
export function supportsStackedPullRequests(account: Account): boolean {
  return isGitHubCloudHost(account.hostname);
}

/**
 * The set of capabilities that gate GraphQL field selections via the custom
 * `@gated(requires: ...)` directive. The keys must match the `requires`
 * argument used in the GraphQL documents.
 */
export type GitHubGatedCapabilities = {
  stackedPullRequests: boolean;
  answeredDiscussion: boolean;
};

/**
 * Resolve the gated-field capabilities for an account. Consumed by the query
 * sanitizer in `graphql/utils.ts` to strip `@gated` selections that the
 * account's GitHub platform/version does not support.
 */
export function getGitHubCapabilities(account: Account): GitHubGatedCapabilities {
  return {
    stackedPullRequests: supportsStackedPullRequests(account),
    answeredDiscussion: supportsAnsweredDiscussion(account),
  };
}
