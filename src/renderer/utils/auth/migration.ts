import { logInfo } from '../../../shared/logger';
import type { Account, AuthState } from '../../types';
import { Constants } from '../constants';
import { loadState, saveState } from '../storage';
import { getUserData } from './utils';

/**
 * Migrate authenticated accounts from old data structure to new data structure (v5.7.0+).
 *
 * @deprecated We plan to remove this migration logic in a future major release.
 */
export async function migrateAuthenticatedAccounts() {
  const existing = loadState();

  if (!hasAccountsToMigrate(existing.auth)) {
    return;
  }

  logInfo(
    'migrateAuthenticatedAccounts',
    'Commencing authenticated accounts migration',
  );

  const migratedAccounts = await convertAccounts(existing.auth);

  saveState({
    auth: { ...existing.auth, accounts: migratedAccounts },
    settings: existing.settings,
  });

  logInfo(
    'migrateAuthenticatedAccounts',
    'Authenticated accounts migration complete',
  );
}

export function hasAccountsToMigrate(existingAuthState: AuthState): boolean {
  if (!existingAuthState) {
    return false;
  }

  // Don't attempt migration if there are already accounts in the new structure
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

export async function convertAccounts(
  existingAuthState: AuthState,
): Promise<Account[]> {
  const migratedAccounts: Account[] = [];

  if (existingAuthState?.token) {
    const user = await getUserData(
      existingAuthState.token,
      Constants.DEFAULT_AUTH_OPTIONS.hostname,
    );

    migratedAccounts.push({
      hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
      platform: 'GitHub Cloud',
      method: 'Personal Access Token',
      token: existingAuthState.token,
      user: user,
    });
  }

  if (existingAuthState?.enterpriseAccounts) {
    for (const legacyEnterpriseAccount of existingAuthState.enterpriseAccounts) {
      const user = await getUserData(
        legacyEnterpriseAccount.token,
        legacyEnterpriseAccount.hostname,
      );

      migratedAccounts.push({
        hostname: legacyEnterpriseAccount.hostname,
        platform: 'GitHub Enterprise Server',
        method: 'OAuth App',
        token: legacyEnterpriseAccount.token,
        user: user,
      });
    }
  }

  return migratedAccounts;
}
