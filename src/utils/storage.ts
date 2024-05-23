import type { AuthState, SettingsState } from '../types';
import { Constants } from './constants';

export const loadState = (): {
  accounts?: AuthState;
  settings?: SettingsState;
} => {
  const existing = localStorage.getItem(Constants.STORAGE_KEY);
  const { auth: accounts, settings } = (existing && JSON.parse(existing)) || {};

  const migratedAccounts = migrateLegacyAccounts(accounts);

  return { accounts: migratedAccounts, settings };
};

export const saveState = (
  accounts: AuthState,
  settings: SettingsState,
): void => {
  const settingsString = JSON.stringify({ auth: accounts, settings });
  localStorage.setItem(Constants.STORAGE_KEY, settingsString);
};

export const clearState = (): void => {
  localStorage.clear();
};

function migrateLegacyAccounts(accounts?: AuthState): AuthState {
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
    // token: accounts.token,
    // enterpriseAccounts: accounts.enterpriseAccounts,
    // user: accounts.user,
  };
}
