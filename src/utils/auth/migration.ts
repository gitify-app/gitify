import type { AuthAccounts } from '../../types';
import Constants from '../constants';

/**
 * Migrate from old authenticated account structure to new account structure (v5.7.0+)
 *
 * @deprecated We plan to remove this migration logic in a future major release.
 * @param accounts
 * @returns
 */
export function migrateLegacyAccounts(accounts?: AuthAccounts): AuthAccounts {
  const migratedAccounts = accounts?.accounts ?? [];

  if (accounts === undefined) {
    return undefined;
  }

  if (migratedAccounts.length > 0) {
    return {
      accounts: migratedAccounts,
    };
  }

  if (accounts?.token) {
    migratedAccounts.push({
      hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
      platform: 'GitHub Cloud',
      method: 'Personal Access Token',
      token: accounts.token,
      user: accounts.user,
    });
  }

  if (accounts?.enterpriseAccounts) {
    for (const legacyEnterpriseAccount of accounts.enterpriseAccounts) {
      migratedAccounts.push({
        hostname: legacyEnterpriseAccount.hostname,
        platform: 'GitHub Enterprise Server',
        method: 'OAuth App',
        token: legacyEnterpriseAccount.token,
        user: null,
      });
    }
  }

  return {
    accounts: migratedAccounts,
  };
}
