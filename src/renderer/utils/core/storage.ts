import { Constants } from '../../constants';

import type { GitifyState } from '../../types';

export function loadState(): GitifyState {
  const existing = localStorage.getItem(Constants.STORAGE.LEGACY);
  const { auth, settings } = (existing && JSON.parse(existing)) || {};
  return { auth, settings };
}

export function saveState(gitifyState: GitifyState) {
  const auth = gitifyState.auth;
  const settings = gitifyState.settings;
  const settingsString = JSON.stringify({ auth, settings });
  localStorage.setItem(Constants.STORAGE.LEGACY, settingsString);
}

export function clearState() {
  localStorage.clear();
}
