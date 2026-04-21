import semver from 'semver';

import type { Account } from '../../types';

import { isForgeGitea } from '../auth/forge';
import { isEnterpriseServerHost } from '../auth/platform';

/**
 * Check if the "Mark as done" feature is supported for the given account.
 *
 * GitHub Cloud or GitHub Enterprise Server 3.13 or newer is required to support this feature.
 */
/**
 * GitHub's REST API supports ignoring a notification thread subscription.
 * Gitea has no equivalent; do not surface unsubscribe as a supported action.
 */
export function isIgnoreThreadSubscriptionSupported(account: Account): boolean {
  return !isForgeGitea(account.forge);
}

export function isMarkAsDoneFeatureSupported(account: Account): boolean {
  if (isForgeGitea(account.forge)) {
    return false;
  }
  if (isEnterpriseServerHost(account.hostname)) {
    if (account.version) {
      return semver.gte(account.version, '3.13.0');
    }

    return false;
  }

  return true;
}

/**
 * Check if the "answered" discussions are supported for the given account.
 *
 * GitHub Cloud or GitHub Enterprise Server 3.12 or newer is required to support this feature.
 */
export function isAnsweredDiscussionFeatureSupported(
  account: Account,
): boolean {
  if (isForgeGitea(account.forge)) {
    return false;
  }
  if (isEnterpriseServerHost(account.hostname)) {
    if (account.version) {
      return semver.gte(account.version, '3.12.0');
    }

    return false;
  }

  return true;
}
