import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { GitHubCliIdentity } from '../../shared/events';

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

/** Whether two CLI identities address the same account. */
function sameCliIdentity(
  existing: GitHubCliIdentity | undefined,
  incoming: GitHubCliIdentity | undefined,
): boolean {
  if (!existing || !incoming || existing.kind !== incoming.kind) {
    return false;
  }

  if (existing.kind === 'environment' || incoming.kind === 'environment') {
    return true;
  }

  return existing.login.toLowerCase() === incoming.login.toLowerCase();
}

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
  loginWithCli: (forge: Forge, hostname: Hostname, identity?: GitHubCliIdentity) => Promise<void>;
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

  const refreshNotificationsInBackground = useCallback(() => {
    // Re-authentication can keep the same query key, so invalidate it even
    // when the account list has not changed. The inbox handles fetching state.
    void queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
  }, [queryClient]);

  /**
   * Create (or update) an account before starting the notification refresh.
   */
  const createAccount = useCallback(
    async (...args: Parameters<typeof createAccountInStore>) => {
      await createAccountInStore(...args);

      refreshNotificationsInBackground();
    },
    [createAccountInStore, refreshNotificationsInBackground],
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
   * the account carries no credential of its own. The chosen CLI identity is
   * recorded so those reads address the same account each time.
   */
  const loginWithCli = useCallback(
    async (forge: Forge, hostname: Hostname, identity?: GitHubCliIdentity) => {
      const { cliAuth } = getAdapter(forge);
      if (!cliAuth) {
        throw new Error(`CLI login is not supported for forge "${forge}".`);
      }

      await cliAuth.resolveToken(hostname, identity);

      const beforeLogin = useAccountsStore.getState().accounts;
      await createAccountInStore(
        cliAuth.authMethod,
        '' as Token,
        hostname,
        forge,
        undefined,
        undefined,
        identity,
      );

      beforeLogin
        .filter(
          (account) =>
            account.forge === forge &&
            account.hostname === hostname &&
            account.method === cliAuth.authMethod &&
            // Unpinned accounts predate identity selection; only one can exist
            // per host, and any CLI login replaces it.
            (account.cliIdentity === undefined || sameCliIdentity(account.cliIdentity, identity)),
        )
        .forEach((account) => removeAccountNotifications(account));

      refreshNotificationsInBackground();
    },
    [createAccountInStore, refreshNotificationsInBackground, removeAccountNotifications],
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
