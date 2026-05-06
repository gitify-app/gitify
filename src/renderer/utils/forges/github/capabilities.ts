import semver from 'semver';

import type { Account } from '../../../types';
import type { ForgeCapabilities } from '../types';

import { isEnterpriseServerHost } from '../../auth/platform';

/**
 * GitHub feature capabilities.
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
  enrichment(): boolean {
    return true;
  },
  answeredDiscussion(account: Account): boolean {
    if (!isEnterpriseServerHost(account.hostname)) {
      return true;
    }
    if (account.version) {
      return semver.gte(account.version, '3.12.0');
    }
    return false;
  },
};
