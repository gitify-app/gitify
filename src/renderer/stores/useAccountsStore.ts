import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Constants } from '../constants';

import type { Account, Forge, Hostname, Token } from '../types';
import type { AuthMethod } from '../utils/auth/types';
import type { AccountsState, AccountsStore } from './types';

import {
  addAccount,
  getAccountUUID,
  getPrimaryAccountHostname,
  hasAccounts,
  hasMultipleAccounts,
  isValidHostname,
  refreshAccount,
  removeAccount,
} from '../utils/auth/utils';
import { rendererLogWarn } from '../utils/core/logger';
import { getAdapter, isKnownForge } from '../utils/forges/registry';
import { decryptValue } from '../utils/system/comms';
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
        const updated = await addAccount(
          { accounts: [...get().accounts] },
          method,
          token,
          hostname,
          forge,
        );

        set({ accounts: updated.accounts });
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
        const updated = removeAccount({ accounts: get().accounts }, account);

        // Drop any forge-specific HTTP client state for the removed account.
        getAdapter(account).onAccountTokenChange?.(account);

        set({ accounts: updated.accounts });
      },

      persistRotatedAccountTokens: async () => {
        const accounts = get().accounts;

        const rotatedAccounts = await Promise.all(
          accounts.map(async (account) => {
            try {
              const { reEncryptedToken } = await decryptValue(account.token);
              if (reEncryptedToken) {
                return { ...account, token: reEncryptedToken as Token };
              }
            } catch {
              // Tokens are expected to already be encrypted at rest; plaintext
              // tokens from pre-encryption releases are no longer migrated.
              // Leave the account unchanged (the user must re-authenticate).
              rendererLogWarn(
                'persistRotatedAccountTokens',
                `token for account ${account.user?.login ?? account.hostname} could not be decrypted; the account may need to be re-authenticated`,
              );
            }
            return account;
          }),
        );

        const tokensRotated = rotatedAccounts.some(
          (account, index) => account.token !== accounts[index]?.token,
        );

        if (tokensRotated) {
          set({ accounts: rotatedAccounts });
        }
      },

      isLoggedIn: () => {
        return hasAccounts({ accounts: get().accounts });
      },

      hasMultipleAccounts: () => {
        return hasMultipleAccounts({ accounts: get().accounts });
      },

      primaryAccountHostname: () => {
        return getPrimaryAccountHostname({ accounts: get().accounts });
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
