import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Constants } from '../constants';

import type { Account, Forge, Hostname, Token } from '../types';
import type { AuthMethod } from '../utils/auth/types';
import type { AccountsState, AccountsStore } from './types';

import { resolvePlatform } from '../utils/auth/platform';
import { getAccountUUID, isValidHostname, refreshAccount } from '../utils/auth/utils';
import { rendererLogInfo, rendererLogWarn } from '../utils/core/logger';
import { getAdapter, isKnownForge } from '../utils/forges/registry';
import { decryptValue, encryptValue } from '../utils/system/comms';
import { DEFAULT_ACCOUNTS_STATE } from './defaults';

/**
 * Sanitise persisted accounts state. Persisted JSON is untrusted (XSS, malicious
 * extension, file-system tampering), so we project only the known fields,
 * coerce `forge` to a registered value, and drop accounts with a
 * structurally invalid hostname before the renderer ever touches them.
 */
export function sanitizeAccounts(accounts: Account[]): Account[] {
  return accounts.flatMap((a) => {
    if (!a.hostname || !isValidHostname(a.hostname)) {
      return [];
    }
    const sanitised: Account = {
      forge: isKnownForge(a.forge) ? a.forge : 'github',
      method: a.method,
      platform: a.platform,
      version: a.version,
      hostname: a.hostname,
      token: a.token,
      user: a.user,
      scopes: a.scopes,
    };
    return [sanitised];
  });
}

/**
 * Gitify Accounts store.
 *
 * Automatically persisted to local storage.
 * Tokens are encrypted via safeStorage before storage.
 */
const useAccountsStore = create<AccountsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_ACCOUNTS_STATE,

      createAccount: async (
        method: AuthMethod,
        token: Token,
        hostname: Hostname,
        forge: Forge = 'github',
      ) => {
        const encryptedToken = await encryptValue(token);

        let newAccount = {
          forge,
          hostname: hostname,
          method: method,
          platform: resolvePlatform(forge, hostname),
          token: encryptedToken,
          user: null, // Will be updated during the refresh call below
        } as Account;

        newAccount = await refreshAccount(newAccount);
        const newAccountUUID = getAccountUUID(newAccount);

        const accounts = get().accounts;
        const existingAccount = accounts.find(
          (account) => getAccountUUID(account) === newAccountUUID,
        );

        if (existingAccount) {
          // Drop any forge-specific HTTP client cache so the new token is used.
          getAdapter(existingAccount).onAccountTokenChange?.(existingAccount);

          // Replace the existing account (e.g. re-authentication with a new token)
          rendererLogInfo(
            'createAccount',
            `updating existing account for user ${newAccount.user?.login}`,
          );

          set({
            accounts: accounts.map((account) =>
              getAccountUUID(account) === newAccountUUID ? newAccount : account,
            ),
          });
        } else {
          set({ accounts: [...accounts, newAccount] });
        }
      },

      refreshAccount: async (account: Account): Promise<Account> => {
        const refreshed = await refreshAccount(account);
        const refreshedUUID = getAccountUUID(refreshed);

        // Persist the refreshed account details
        set((state) => ({
          accounts: state.accounts.map((a) =>
            getAccountUUID(a) === refreshedUUID ? refreshed : a,
          ),
        }));

        return refreshed;
      },

      removeAccount: (account) => {
        // Drop any forge-specific HTTP client state for the removed account.
        getAdapter(account).onAccountTokenChange?.(account);

        set((state) => ({
          accounts: state.accounts.filter((a) => a.token !== account.token),
        }));
      },

      migrateAccountTokens: async () => {
        const accounts = get().accounts;

        const migratedAccounts = await Promise.all(
          accounts.map(async (account) => {
            try {
              const { reEncryptedToken } = await decryptValue(account.token);
              if (reEncryptedToken) {
                return { ...account, token: reEncryptedToken as Token };
              }
              return account;
            } catch {
              rendererLogWarn(
                'migrateAccountTokens',
                `token for account ${account.user?.login ?? account.hostname} could not be decrypted, re-encrypting`,
              );
              const encryptedToken = (await encryptValue(account.token)) as Token;
              return { ...account, token: encryptedToken };
            }
          }),
        );

        const tokensMigrated = migratedAccounts.some((migratedAccount) => {
          const originalAccount = accounts.find(
            (account) => getAccountUUID(account) === getAccountUUID(migratedAccount),
          );

          return !originalAccount || migratedAccount.token !== originalAccount.token;
        });

        if (tokensMigrated) {
          set({ accounts: migratedAccounts });
        }
      },

      isLoggedIn: () => {
        return get().accounts.length > 0;
      },

      hasMultipleAccounts: () => {
        return get().accounts.length > 1;
      },

      primaryAccountHostname: () => {
        return get().accounts[0]?.hostname ?? Constants.GITHUB_HOSTNAME;
      },

      reset: () => {
        set({ ...DEFAULT_ACCOUNTS_STATE });
      },
    }),
    {
      name: Constants.STORAGE.ACCOUNTS,
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<AccountsState>;

        return {
          ...current,
          ...persistedState,
          accounts: sanitizeAccounts(persistedState.accounts ?? []),
        };
      },
    },
  ),
);

export default useAccountsStore;
