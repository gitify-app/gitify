import type { Account, AuthState } from '../../types';
import Constants from '../constants';
import { loadState, saveState } from '../storage';

/**
 * Migrate authenticated accounts from old data structure to new data structure (v5.7.0+).
 *
 * @deprecated We plan to remove this migration logic in a future major release.
 */
export function migrateAuthenticatedAccounts() {
  const existing = loadState();

  if (hasAccountsToMigrate(existing.auth)) {
    console.log('Commencing authenticated accounts migration');

    const migratedAccounts = convertAccounts(existing.auth);

    saveState({
      auth: { ...existing.auth, accounts: migratedAccounts },
      settings: existing.settings,
    });
    console.log('Authenticated accounts migration complete');
  }
}

export function hasAccountsToMigrate(existingAuthState: AuthState): boolean {
  if (!existingAuthState) {
    return false;
  }

  if (existingAuthState?.accounts?.length > 0) {
    return false;
  }

  if (
    existingAuthState?.token ||
    existingAuthState?.enterpriseAccounts?.length > 0
  ) {
    return true;
  }

  return false;
}

export function convertAccounts(existingAuthState: AuthState): Account[] {
  const migratedAccounts: Account[] = [];

  if (existingAuthState?.token) {
    migratedAccounts.push({
      hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
      platform: 'GitHub Cloud',
      method: 'Personal Access Token',
      token: existingAuthState.token,
      user: existingAuthState.user,
    });
  }

  if (existingAuthState?.enterpriseAccounts) {
    for (const legacyEnterpriseAccount of existingAuthState.enterpriseAccounts) {
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
