import semver from 'semver';

import type { Account } from '../../../types';
import type { ForgeCapabilities } from '../types';

import { isEnterpriseServerHost } from '../../auth/platform';

/**
 * GitHub feature capabilities exposed through the forge adapter contract.
 *
 * GitHub Cloud and GitHub Enterprise Cloud with Data Residency support
 * everything; GitHub Enterprise Server gates certain features behind a
 * minimum version.
 */
export const githubCapabilities: ForgeCapabilities = {
  markAsDone(account: Account): boolean {
    if (!isEnterpriseServerHost(account.hostname)) {
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
  if (!isEnterpriseServerHost(account.hostname)) {
    return true;
  }
  if (account.version) {
    return semver.gte(account.version, '3.12.0');
  }
  return false;
}
