import type { AuthAccounts, SettingsState } from '../types';
import { migrateLegacyAccounts } from './auth/migration';
import { Constants } from './constants';

export function loadState() {
  const existing = localStorage.getItem(Constants.STORAGE_KEY);
  const { auth: accounts, settings } = (existing && JSON.parse(existing)) || {};

  const migratedAccounts = migrateLegacyAccounts(accounts);

  return { accounts: migratedAccounts, settings };
}

export function saveState(auth: AuthAccounts, settings: SettingsState) {
  const settingsString = JSON.stringify({ auth, settings });
  localStorage.setItem(Constants.STORAGE_KEY, settingsString);
}

export function clearState() {
  localStorage.clear();
}
