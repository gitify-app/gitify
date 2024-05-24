import type { AuthState, SettingsState } from '../types';
import { Constants } from './constants';

export function loadState(): {
  auth: AuthState;
  settings: SettingsState;
} {
  const existing = localStorage.getItem(Constants.STORAGE_KEY);
  const { auth, settings } = (existing && JSON.parse(existing)) || {};
  return { auth, settings };
}

export function saveState(auth: AuthState, settings: SettingsState) {
  const settingsString = JSON.stringify({ auth, settings });
  localStorage.setItem(Constants.STORAGE_KEY, settingsString);
}

export function clearState() {
  localStorage.clear();
}
