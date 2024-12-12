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
      const version = account?.version.split('.').map(Number);
      return version[0] >= 3 && version[1] >= 13;
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
      const version = account?.version.split('.').map(Number);
      return version[0] >= 3 && version[1] >= 12;
    }

    return false;
  }

  return true;
}
