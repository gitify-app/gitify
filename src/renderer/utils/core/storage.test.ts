import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';

import { Constants } from '../../constants';

import { useAccountsStore, useSettingsStore } from '../../stores';

import { Theme } from '../../types';

import { migrateLegacyStoreToZustand } from './storage';

describe('renderer/utils/core/storage.ts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does nothing when no legacy storage exists', () => {
    migrateLegacyStoreToZustand();

    expect(useAccountsStore.getState().accounts).toEqual([]);
    expect(localStorage.getItem(Constants.STORAGE.LEGACY)).toBeNull();
  });

  it('migrates legacy auth and settings into the stores and marks the key as migrated', () => {
    localStorage.setItem(
      Constants.STORAGE.LEGACY,
      JSON.stringify({
        auth: { accounts: [mockGitHubCloudAccount] },
        settings: { theme: Theme.DARK, playSound: false },
      }),
    );

    migrateLegacyStoreToZustand();

    expect(useAccountsStore.getState().accounts).toHaveLength(1);
    expect(useAccountsStore.getState().accounts[0].hostname).toBe(mockGitHubCloudAccount.hostname);
    expect(useSettingsStore.getState().theme).toBe(Theme.DARK);
    expect(useSettingsStore.getState().playSound).toBe(false);

    const marker = JSON.parse(localStorage.getItem(Constants.STORAGE.LEGACY)!);
    expect(marker.migrated).toBe(true);
    expect(marker.migratedAt).toBeDefined();
  });

  it('drops legacy accounts with invalid hostnames during migration', () => {
    localStorage.setItem(
      Constants.STORAGE.LEGACY,
      JSON.stringify({
        auth: { accounts: [{ ...mockGitHubCloudAccount, hostname: 'not a hostname' }] },
      }),
    );

    migrateLegacyStoreToZustand();

    expect(useAccountsStore.getState().accounts).toEqual([]);
  });

  it('does not overwrite existing accounts in the store', () => {
    useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
    localStorage.setItem(
      Constants.STORAGE.LEGACY,
      JSON.stringify({
        auth: { accounts: [] },
      }),
    );

    migrateLegacyStoreToZustand();

    expect(useAccountsStore.getState().accounts).toHaveLength(1);
  });

  it('skips migration when already migrated', () => {
    localStorage.setItem(
      Constants.STORAGE.LEGACY,
      JSON.stringify({ migrated: true, migratedAt: '2026-01-01T00:00:00Z' }),
    );

    migrateLegacyStoreToZustand();

    expect(useAccountsStore.getState().accounts).toEqual([]);
    const marker = JSON.parse(localStorage.getItem(Constants.STORAGE.LEGACY)!);
    expect(marker.migratedAt).toBe('2026-01-01T00:00:00Z');
  });

  it('logs an error and leaves stores untouched on malformed legacy data', () => {
    localStorage.setItem(Constants.STORAGE.LEGACY, 'not-json');

    expect(() => migrateLegacyStoreToZustand()).not.toThrow();

    expect(useAccountsStore.getState().accounts).toEqual([]);
    // The legacy key is left as-is so the malformed payload can be inspected
    expect(localStorage.getItem(Constants.STORAGE.LEGACY)).toBe('not-json');
  });
});
