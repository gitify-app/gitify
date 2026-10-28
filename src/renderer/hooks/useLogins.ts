import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useAccountsStore } from '../stores';

import type { Account, ClientID, Forge, Hostname, Token } from '../types';
import type {
  AuthMethod,
  DeviceFlowSession,
  LoginPersonalAccessTokenOptions,
} from '../utils/auth/types';

import { notificationsKeys } from '../utils/api/queryKeys';
import { getAccountAdapter, getAdapter } from '../utils/forges/registry';
import { encryptValue } from '../utils/system/comms';
import { useNotificationActions } from './notifications/useNotificationActions';

interface LoginsState {
  loginWithDeviceFlowStart: (
    forge: Forge,
    hostname?: Hostname,
    scopes?: string[],
    clientId?: ClientID,
  ) => Promise<DeviceFlowSession>;
  loginWithDeviceFlowPoll: (forge: Forge, session: DeviceFlowSession) => Promise<Token | null>;
  loginWithDeviceFlowComplete: (
    forge: Forge,
    token: Token,
    hostname: Hostname,
    clientId?: ClientID,
  ) => Promise<void>;
  loginWithCli: (forge: Forge, hostname: Hostname) => Promise<void>;
  loginWithPersonalAccessToken: (data: LoginPersonalAccessTokenOptions) => Promise<void>;
  logoutFromAccount: (account: Account) => void;
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

  const { removeAccountNotifications } = useNotificationActions();

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
    async (forge: Forge, hostname?: Hostname, scopes?: string[], clientId?: ClientID) => {
      const { deviceFlow } = getAdapter(forge);
      if (!deviceFlow) {
        throw new Error(`Device flow is not supported for forge "${forge}".`);
      }
      return await deviceFlow.start(hostname, scopes, clientId);
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
    async (forge: Forge, token: Token, hostname: Hostname, clientId?: ClientID) => {
      const { deviceFlow, customOAuthApp } = getAdapter(forge);
      if (!deviceFlow) {
        throw new Error(`Forge "${forge}" does not support device flow.`);
      }
      // A supplied client ID means the user authorized their own app; without
      // one the flow used Gitify's preconfigured app.
      const method: AuthMethod =
        clientId && customOAuthApp ? customOAuthApp.authMethod : deviceFlow.authMethod;

      const existingAccount = accounts.find((a) => a.hostname === hostname && a.method === method);
      if (existingAccount) {
        removeAccountNotifications(existingAccount);
      }

      await createAccount(method, token, hostname, forge, undefined, clientId);
    },
    [accounts, createAccount, removeAccountNotifications],
  );

  /**
   * Login with the token held by a locally installed forge CLI.
   *
   * The token is resolved here only to fail fast while the login screen is
   * still up. Nothing persists it: the CLI is re-read for every API request, so
   * the account carries no credential of its own.
   */
  const loginWithCli = useCallback(
    async (forge: Forge, hostname: Hostname) => {
      const { cliAuth } = getAdapter(forge);
      if (!cliAuth) {
        throw new Error(`CLI login is not supported for forge "${forge}".`);
      }

      await cliAuth.resolveToken(hostname);

      const existingAccounts = useAccountsStore
        .getState()
        .accounts.filter(
          (a) => a.forge === forge && a.hostname === hostname && a.method === cliAuth.authMethod,
        );
      await createAccountInStore(cliAuth.authMethod, '' as Token, hostname, forge);

      existingAccounts.forEach((account) => removeAccountNotifications(account));

      await queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
    [createAccountInStore, queryClient, removeAccountNotifications],
  );

  /**
   * Login with Personal Access Token (PAT).
   */
  const loginWithPersonalAccessToken = useCallback(
    async ({ token, hostname, forge, username }: LoginPersonalAccessTokenOptions) => {
      const resolvedForge: Forge = forge ?? 'github';
      const encryptedToken = (await encryptValue(token)) as Token;
      await getAccountAdapter({
        forge: resolvedForge,
        hostname,
        token: encryptedToken,
        username,
      } as Account).fetchAuthenticatedUser();

      const existingAccount = accounts.find(
        (a) =>
          a.hostname === hostname &&
          a.method === 'Personal Access Token' &&
          a.forge === resolvedForge,
      );
      if (existingAccount) {
        removeAccountNotifications(existingAccount);
      }

      await createAccount('Personal Access Token', token, hostname, resolvedForge, username);
    },
    [accounts, createAccount, removeAccountNotifications],
  );

  const logoutFromAccount = useCallback(
    (account: Account) => {
      removeAccountNotifications(account);

      removeAccount(account);
    },
    [removeAccountNotifications, removeAccount],
  );

  return {
    loginWithDeviceFlowStart,
    loginWithDeviceFlowPoll,
    loginWithDeviceFlowComplete,
    loginWithCli,
    loginWithPersonalAccessToken,
    logoutFromAccount,
  };
};
