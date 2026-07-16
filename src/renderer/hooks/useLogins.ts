import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useAccountsStore } from '../stores';

import type { Account, Forge, Hostname, Token } from '../types';
import type {
  DeviceFlowSession,
  LoginOAuthWebOptions,
  LoginPersonalAccessTokenOptions,
} from '../utils/auth/types';

import { notificationsKeys } from '../utils/api/queryKeys';
import { getAdapter } from '../utils/forges/registry';
import { encryptValue } from '../utils/system/comms';
import { useNotifications } from './useNotifications';

interface LoginsState {
  loginWithDeviceFlowStart: (
    forge: Forge,
    hostname?: Hostname,
    scopes?: string[],
  ) => Promise<DeviceFlowSession>;
  loginWithDeviceFlowPoll: (forge: Forge, session: DeviceFlowSession) => Promise<Token | null>;
  loginWithDeviceFlowComplete: (forge: Forge, token: Token, hostname: Hostname) => Promise<void>;
  loginWithOAuthApp: (forge: Forge, data: LoginOAuthWebOptions) => Promise<void>;
  loginWithPersonalAccessToken: (data: LoginPersonalAccessTokenOptions) => Promise<void>;
  logoutFromAccount: (account: Account) => Promise<void>;
}

/**
 * Hook providing the forge login and logout flows.
 *
 * Account state changes are written to the accounts store; notification
 * caches are invalidated / pruned accordingly.
 */
export const useLogins = (): LoginsState => {
  const queryClient = useQueryClient();

  const accounts = useAccountsStore((s) => s.accounts);
  const createAccountInStore = useAccountsStore((s) => s.createAccount);
  const removeAccount = useAccountsStore((s) => s.removeAccount);

  const { removeAccountNotifications } = useNotifications();

  /**
   * Create (or update) an account, then refetch notifications. Re-authenticating
   * an existing account keeps the same account identity, so the notifications
   * query key does not change and the cache must be invalidated explicitly.
   */
  const createAccount = useCallback(
    async (...args: Parameters<typeof createAccountInStore>) => {
      await createAccountInStore(...args);

      await queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
    [createAccountInStore, queryClient],
  );

  /**
   * Initiate an OAuth device-flow session for the given forge.
   */
  const loginWithDeviceFlowStart = useCallback(
    async (forge: Forge, hostname?: Hostname, scopes?: string[]) => {
      const { deviceFlow } = getAdapter(forge);
      if (!deviceFlow) {
        throw new Error(`Device flow is not supported for forge "${forge}".`);
      }
      return await deviceFlow.start(hostname, scopes);
    },
    [],
  );

  /**
   * Poll for completion of an OAuth device-flow session.
   */
  const loginWithDeviceFlowPoll = useCallback(async (forge: Forge, session: DeviceFlowSession) => {
    const { deviceFlow } = getAdapter(forge);
    if (!deviceFlow) {
      throw new Error(`Device flow is not supported for forge "${forge}".`);
    }
    return await deviceFlow.poll(session);
  }, []);

  /**
   * Finalise an OAuth device-flow session by recording the account.
   */
  const loginWithDeviceFlowComplete = useCallback(
    async (forge: Forge, token: Token, hostname: Hostname) => {
      const { deviceFlow } = getAdapter(forge);
      if (!deviceFlow) {
        throw new Error(`Forge "${forge}" does not support device flow.`);
      }
      const method = deviceFlow.authMethod;

      const existingAccount = accounts.find((a) => a.hostname === hostname && a.method === method);
      if (existingAccount) {
        await removeAccountNotifications(existingAccount);
      }

      await createAccount(method, token, hostname, forge);
    },
    [accounts, createAccount, removeAccountNotifications],
  );

  /**
   * Login with a custom OAuth app on the given forge.
   */
  const loginWithOAuthApp = useCallback(
    async (forge: Forge, data: LoginOAuthWebOptions) => {
      const { oauthWebApp } = getAdapter(forge);
      if (!oauthWebApp) {
        throw new Error(`OAuth app login is not supported for forge "${forge}".`);
      }

      const { authOptions, authCode } = await oauthWebApp.performWebOAuth(data);
      const token = await oauthWebApp.exchangeAuthCodeForToken(authCode, authOptions);

      const existingAccount = accounts.find(
        (a) => a.hostname === authOptions.hostname && a.method === 'OAuth App',
      );
      if (existingAccount) {
        await removeAccountNotifications(existingAccount);
      }

      await createAccount('OAuth App', token, authOptions.hostname, forge);
    },
    [accounts, createAccount, removeAccountNotifications],
  );

  /**
   * Login with Personal Access Token (PAT).
   */
  const loginWithPersonalAccessToken = useCallback(
    async ({ token, hostname, forge }: LoginPersonalAccessTokenOptions) => {
      const resolvedForge: Forge = forge ?? 'github';
      const encryptedToken = (await encryptValue(token)) as Token;
      await getAdapter(resolvedForge).fetchAuthenticatedUser({
        forge: resolvedForge,
        hostname,
        token: encryptedToken,
      } as Account);

      const existingAccount = accounts.find(
        (a) =>
          a.hostname === hostname &&
          a.method === 'Personal Access Token' &&
          a.forge === resolvedForge,
      );
      if (existingAccount) {
        await removeAccountNotifications(existingAccount);
      }

      await createAccount('Personal Access Token', token, hostname, resolvedForge);
    },
    [accounts, createAccount, removeAccountNotifications],
  );

  const logoutFromAccount = useCallback(
    async (account: Account) => {
      await removeAccountNotifications(account);

      removeAccount(account);
    },
    [removeAccountNotifications, removeAccount],
  );

  return {
    loginWithDeviceFlowStart,
    loginWithDeviceFlowPoll,
    loginWithDeviceFlowComplete,
    loginWithOAuthApp,
    loginWithPersonalAccessToken,
    logoutFromAccount,
  };
};
