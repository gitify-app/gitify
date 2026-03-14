import { Constants } from '../../constants';

import type { GitifyState } from '../../types';

export function loadState(): GitifyState {
  const existing = localStorage.getItem(Constants.STORAGE_KEY);
  const { auth, settings } = (existing && JSON.parse(existing)) || {};
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

/**
 * One-time migration: seeds Zustand persist keys from the legacy single-blob
 * storage key and removes the legacy entry.
 *
 * Idempotent: skips seeding if Zustand keys already exist.
 * Safe to call before Zustand initialises (reads/writes localStorage directly).
 */
export function migrateStorageToStores(): void {
  const legacy = localStorage.getItem(Constants.STORAGE_KEY);
  if (!legacy) {
    return;
  }

  // Only seed Zustand keys if they do not already exist
  const accountsAlreadyMigrated = localStorage.getItem(
    Constants.ACCOUNTS_STORE_KEY,
  );
  const settingsAlreadyMigrated = localStorage.getItem(
    Constants.SETTINGS_STORE_KEY,
  );

  if (accountsAlreadyMigrated && settingsAlreadyMigrated) {
    // Both store keys present — just remove the legacy blob
    localStorage.removeItem(Constants.STORAGE_KEY);
    return;
  }

  try {
    const { auth, settings } = JSON.parse(legacy);

    if (auth && !accountsAlreadyMigrated) {
      localStorage.setItem(
        Constants.ACCOUNTS_STORE_KEY,
        JSON.stringify({ state: auth, version: 0 }),
      );
    }

    if (settings && !settingsAlreadyMigrated) {
      localStorage.setItem(
        Constants.SETTINGS_STORE_KEY,
        JSON.stringify({ state: settings, version: 0 }),
      );
    }
  } catch {
    // Corrupt legacy state — nothing to migrate
  }

  localStorage.removeItem(Constants.STORAGE_KEY);
}
