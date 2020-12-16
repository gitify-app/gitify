import { AuthState, SettingsState } from '../types';
import { Constants } from './constants';

export const loadState = (): {
  accounts?: AuthState;
  settings?: SettingsState;
} => {
  const existing = localStorage.getItem(Constants.STORAGE_KEY);
  const { auth: accounts, settings } = (existing && JSON.parse(existing)) || {};
  return { accounts, settings };
};

export const saveState = (
  accounts: AuthState,
  settings: SettingsState
): void => {
  const settingsString = JSON.stringify({ auth: accounts, settings });
  localStorage.setItem(Constants.STORAGE_KEY, settingsString);
};

export const clearState = (): void => {
  localStorage.clear();
};
