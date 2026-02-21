import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Constants } from '../constants';

import type { Account, Hostname, Link, Token } from '../types';
import type { AuthMethod } from '../utils/auth/types';
import type { AccountsStore } from './types';

import { fetchAuthenticatedUserDetails } from '../utils/api/client';
import { extractHostVersion, getAccountUUID } from '../utils/auth/utils';
import { encryptValue } from '../utils/comms';
import { getPlatformFromHostname } from '../utils/helpers';
import { rendererLogError, rendererLogWarn } from '../utils/logger';
import { DEFAULT_ACCOUNTS_STATE } from './defaults';

/**
 * Atlassify Accounts store.
 *
 * Automatically persisted to local storage.
 * Tokens are encrypted via safeStorage before storage.
 */
const useAccountsStore = create<AccountsStore>()(
  persist(
    (set, get, store) => ({
      ...DEFAULT_ACCOUNTS_STATE,

      addAccount: (account) => {
        set((state) => ({
          accounts: [...state.accounts, account],
        }));
      },

      createAccount: async (
        method: AuthMethod,
        token: Token,
        hostname: Hostname,
      ) => {
        const encryptedToken = await encryptValue(token);

        let newAccount = {
          hostname: hostname,
          method: method,
          platform: getPlatformFromHostname(hostname),
          token: encryptedToken,
          user: null, // Will be updated during the refresh call below
        } as Account;

        // Refresh user data
        newAccount = await get().refreshAccount(newAccount);

        set((state) => ({
          accounts: [...state.accounts, newAccount],
        }));
      },

      refreshAccount: async (account: Account): Promise<Account> => {
        try {
          const response = await fetchAuthenticatedUserDetails(account);

          const user = response.data;

          // Refresh user data
          account.user = {
            id: String(user.id),
            login: user.login,
            name: user.name,
            avatar: user.avatar_url as Link,
          };

          account.version = 'latest';

          account.version = extractHostVersion(
            response.headers['x-github-enterprise-version'] as string,
          );

          const accountScopes = response.headers['x-oauth-scopes']
            ?.split(',')
            .map((scope: string) => scope.trim());

          account.hasRequiredScopes =
            Constants.OAUTH_SCOPES.RECOMMENDED.every((scope) =>
              accountScopes.includes(scope),
            ) ||
            Constants.OAUTH_SCOPES.ALTERNATE.every((scope) =>
              accountScopes.includes(scope),
            );

          if (!account.hasRequiredScopes) {
            rendererLogWarn(
              'refreshAccount',
              `account for user ${account.user.login} is missing required scopes`,
            );
          }
        } catch (err) {
          rendererLogError(
            'refreshAccount',
            `failed to refresh account for user ${account.user?.login ?? account.hostname}`,
            err,
          );
        }

        return account;
      },

      removeAccount: (account) => {
        set((state) => ({
          accounts: state.accounts.filter(
            (a) => getAccountUUID(a) !== getAccountUUID(account),
          ),
        }));
      },

      hasAccounts: () => {
        return get().accounts.length > 0;
      },

      hasMultipleAccounts: () => {
        return get().accounts.length > 1;
      },

      isLoggedIn: () => {
        return get().hasAccounts();
      },

      primaryAccountHostname: () => {
        const accounts = get().accounts;
        if (accounts.length === 0) {
          return Constants.GITHUB_HOSTNAME;
        }
        return accounts[0].hostname;
      },

      reset: () => {
        set(store.getInitialState());
      },
    }),
    {
      name: Constants.ACCOUNTS_STORE_KEY,
    },
  ),
);

export default useAccountsStore;
