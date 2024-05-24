import type { AuthAccounts, SettingsState } from '../types';
import { Constants } from './constants';

export function loadState(): {
  authAccounts: AuthAccounts;
  settings: SettingsState;
} {
  const existing = localStorage.getItem(Constants.STORAGE_KEY);
  const { auth: authAccounts, settings } =
    (existing && JSON.parse(existing)) || {};
  return { authAccounts, settings };
}

export function saveState(authAccounts: AuthAccounts, settings: SettingsState) {
  const settingsString = JSON.stringify({ auth: authAccounts, settings });
  localStorage.setItem(Constants.STORAGE_KEY, settingsString);
}

export function clearState() {
  localStorage.clear();
}
