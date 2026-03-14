import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Constants } from '../constants';

import type { Account, AuthState, Hostname, Token } from '../types';
import type {
  LoginOAuthWebOptions,
  LoginPersonalAccessTokenOptions,
} from '../utils/auth/types';

import { fetchAuthenticatedUserDetails } from '../utils/api/client';
import { clearOctokitClientCache } from '../utils/api/octokit';
import {
  addAccount,
  exchangeAuthCodeForAccessToken,
  performGitHubWebOAuth,
  pollGitHubDeviceFlow,
  removeAccount,
  startGitHubDeviceFlow,
} from '../utils/auth/utils';
import { encryptValue } from '../utils/system/comms';

import type { AccountsStore } from './types';

import { DEFAULT_ACCOUNTS_STATE } from './defaults';

/**
 * Gitify Accounts store.
 *
 * Automatically persisted to local storage.
 */
const useAccountsStore = create<AccountsStore>()(
  persist(
    (set, get, store) => ({
      ...DEFAULT_ACCOUNTS_STATE,

      isLoggedIn: () => get().accounts.length > 0,

      loginWithDeviceFlowStart: async (hostname?: Hostname) =>
        await startGitHubDeviceFlow(hostname),

      loginWithDeviceFlowPoll: async (session) =>
        await pollGitHubDeviceFlow(session),

      loginWithDeviceFlowComplete: async (token: Token, hostname: Hostname) => {
        const auth: AuthState = { accounts: get().accounts };
        const updatedAuth = await addAccount(auth, 'GitHub App', token, hostname);
        set({ accounts: updatedAuth.accounts });
      },

      loginWithOAuthApp: async (data: LoginOAuthWebOptions) => {
        const { authOptions, authCode } = await performGitHubWebOAuth(data);
        const token = await exchangeAuthCodeForAccessToken(authCode, authOptions);
        const auth: AuthState = { accounts: get().accounts };
        const updatedAuth = await addAccount(
          auth,
          'OAuth App',
          token,
          authOptions.hostname,
        );
        set({ accounts: updatedAuth.accounts });
      },

      loginWithPersonalAccessToken: async ({
        token,
        hostname,
      }: LoginPersonalAccessTokenOptions) => {
        const encryptedToken = (await encryptValue(token)) as Token;
        await fetchAuthenticatedUserDetails({
          hostname,
          token: encryptedToken,
        } as Account);
        const auth: AuthState = { accounts: get().accounts };
        const updatedAuth = await addAccount(
          auth,
          'Personal Access Token',
          token,
          hostname,
        );
        set({ accounts: updatedAuth.accounts });
      },

      logoutFromAccount: (account: Account) => {
        const auth: AuthState = { accounts: get().accounts };
        const updatedAuth = removeAccount(auth, account);
        clearOctokitClientCache();
        set({ accounts: updatedAuth.accounts });
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
