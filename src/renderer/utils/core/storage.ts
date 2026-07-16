import { Constants } from '../../constants';

import { DEFAULT_SETTINGS_STATE, useAccountsStore, useSettingsStore } from '../../stores';
import { sanitizeAccounts } from '../../stores/useAccountsStore';

import { rendererLogError, rendererLogInfo, toError } from './logger';

/**
 * Migrate from Context-based storage to Zustand stores.
 * This function reads the old unified storage format and splits it into separate stores.
 * Should be called once on app startup.
 *
 * TODO: Remove this migration function in a future major release
 * once all users have migrated from the old Context-based storage format.
 */
export function migrateLegacyStoreToZustand() {
  const existing = localStorage.getItem(Constants.STORAGE.LEGACY);

  if (!existing) {
    // No old data to migrate
    return;
  }

  try {
    const parsed = JSON.parse(existing);

    // Skip if already migrated
    if (parsed.migrated) {
      rendererLogInfo(
        'migrateLegacyStoreToZustand',
        `Storage already migrated on ${parsed.migratedAt}`,
      );
      return;
    }

    const { auth, settings } = parsed;

    // Migrate auth to AccountsStore if it exists and store is empty
    if (auth?.accounts && useAccountsStore.getState().accounts.length === 0) {
      useAccountsStore.setState({ accounts: sanitizeAccounts(auth.accounts) });
    }

    // Migrate app settings to SettingsStore, keeping only known settings keys
    // so obsolete legacy keys are not persisted into the new store.
    if (settings) {
      const knownSettings = Object.fromEntries(
        Object.entries(settings).filter(([key]) => key in DEFAULT_SETTINGS_STATE),
      );
      useSettingsStore.setState(knownSettings);
    }

    // Mark old storage key as migrated instead of removing it
    localStorage.setItem(
      Constants.STORAGE.LEGACY,
      JSON.stringify({
        migrated: true,
        migratedAt: new Date().toISOString(),
      }),
    );

    rendererLogInfo(
      'migrateLegacyStoreToZustand',
      'Successfully migrated from Context storage to Zustand stores',
    );
  } catch (err) {
    rendererLogError('migrateLegacyStoreToZustand', 'Error during storage migration', toError(err));
  }
}
