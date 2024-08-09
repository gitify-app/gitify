import { defaultAuth, defaultSettings } from '../context/App';
import type { GitifyState } from '../types';
import { Constants } from './constants';

export function loadState(): GitifyState {
  const existing = localStorage.getItem(Constants.STORAGE_KEY);
  const { auth, settings } = (existing && JSON.parse(existing)) || {
    auth: defaultAuth,
    settings: defaultSettings,
  };
  return { auth, settings };
}

export function saveState(gitifyState: GitifyState) {
  const auth = gitifyState.auth;
  const settings = gitifyState.settings;
  const settingsString = JSON.stringify({ auth, settings });
  localStorage.setItem(Constants.STORAGE_KEY, settingsString);
}

export function clearState() {
  localStorage.clear();
}
