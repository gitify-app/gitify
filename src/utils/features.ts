import semver from 'semver';

import type { Account } from '../types';

import { isEnterpriseServerHost } from './helpers';

/**
 * Check if the "Mark as done" feature is supported for the given account.
 *
 * GitHub Cloud or GitHub Enterprise Server 3.13 or newer is required to support this feature.
 */

export function isMarkAsDoneFeatureSupported(account: Account): boolean {
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
  if (isEnterpriseServerHost(account.hostname)) {
    if (account.version) {
      return semver.gte(account.version, '3.12.0');
    }

    return false;
  }

  return true;
}
