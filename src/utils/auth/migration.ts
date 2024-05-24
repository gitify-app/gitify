import type { Account, AuthAccounts } from '../../types';
import Constants from '../constants';
import { loadState, saveState } from '../storage';

/**
 * Migrate authenticated accounts from old data structure to new data structure (v5.7.0+).
 *
 * @deprecated We plan to remove this migration logic in a future major release.
 */
export function migrateAuthenticatedAccounts() {
  const existing = loadState();

  if (hasAccountsToMigrate(existing.authAccounts)) {
    console.log('Commencing authenticated accounts migration');

    const migratedAccounts = convertAccounts(existing.authAccounts);

    saveState({ accounts: migratedAccounts }, existing.settings);
    console.log('Authenticated accounts migration complete');
  }
}

export function hasAccountsToMigrate(
  existingAuthAccounts: AuthAccounts,
): boolean {
  return (
    !!existingAuthAccounts?.token ||
    existingAuthAccounts?.enterpriseAccounts?.length > 0
  );
}

export function convertAccounts(existingAuthAccounts: AuthAccounts): Account[] {
  const migratedAccounts: Account[] = [];

  if (existingAuthAccounts?.token) {
    migratedAccounts.push({
      hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
      platform: 'GitHub Cloud',
      method: 'Personal Access Token',
      token: existingAuthAccounts.token,
      user: existingAuthAccounts.user,
    });
  }

  if (existingAuthAccounts?.enterpriseAccounts) {
    for (const legacyEnterpriseAccount of existingAuthAccounts.enterpriseAccounts) {
      migratedAccounts.push({
        hostname: legacyEnterpriseAccount.hostname,
        platform: 'GitHub Enterprise Server',
        method: 'OAuth App',
        token: legacyEnterpriseAccount.token,
        user: null,
      });
    }
  }

  return migratedAccounts;
}
