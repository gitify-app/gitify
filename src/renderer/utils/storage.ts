import { Constants } from '../constants';

import { useAccountsStore, useSettingsStore } from '../stores';

import { rendererLogError, rendererLogInfo } from './logger';

/**
 * Migrate from Context-based storage to Zustand stores.
 * This function reads the old unified storage format and splits it into separate stores.
 * Should be called once on app startup.
 *
 * TODO: Remove this migration function in a future major release (v8.0.0+)
 * once all users have migrated from the old Context-based storage format.
 * Migration was introduced in v7.0.0.
 */
export async function migrateContextToZustand() {
  const existing = localStorage.getItem(Constants.STORAGE_KEY);

  if (!existing) {
    // No old data to migrate
    return;
  }

  try {
    const parsed = JSON.parse(existing);

    // Skip if already migrated
    if (parsed.migrated) {
      rendererLogInfo(
        'migrateContextToStore',
        `Storage already migrated on ${parsed.migratedAt}`,
      );
      return;
    }

    const { auth, settings } = parsed;

    // Migrate auth to AccountsStore if it exists and store is empty
    if (auth?.accounts && useAccountsStore.getState().accounts.length === 0) {
      useAccountsStore.setState({ accounts: auth.accounts });
    }

    // Migrate settings to SettingsStore
    if (settings) {
      // Migrate app settings to SettingsStore (Zustand will ignore unknown properties)
      useSettingsStore.setState({ ...settings });
    }

    // Mark old storage key as migrated instead of removing it
    localStorage.setItem(
      Constants.STORAGE_KEY,
      JSON.stringify({
        migrated: true,
        migratedAt: new Date().toISOString(),
      }),
    );

    rendererLogInfo(
      'migrateContextToStore',
      'Successfully migrated from Context storage to Zustand stores',
    );
  } catch (err) {
    rendererLogError(
      'migrateContextToStore',
      'Error during storage migration',
      err,
    );
    // Don't throw - let the app continue with defaults
  }
}

export function clearState() {
  localStorage.clear();
}
