import { act, renderHook } from '@testing-library/react';

import {
  mockCustomOAuthAppAccount,
  mockGiteaAccount,
  mockGitHubCliAccount,
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';
import { mockRawUser } from '../utils/forges/github/__mocks__/response-mocks';

import type { Account, ClientID, Forge, Hostname, Link, Token } from '../types';
import type { AuthMethod } from '../utils/auth/types';
import type { GetAuthenticatedUserResponse } from '../utils/forges/github/types';

import { getRecommendedScopeNames } from '../utils/auth/scopes';
import { getAccountUUID } from '../utils/auth/utils';
import * as logger from '../utils/core/logger';
import * as apiClient from '../utils/forges/github/client';
import { getAdapter } from '../utils/forges/registry';
import * as comms from '../utils/system/comms';
import { DEFAULT_ACCOUNTS_STATE } from './defaults';
import useAccountsStore, { sanitizeAccounts } from './useAccountsStore';

describe('renderer/stores/useAccountsStore.ts', () => {
  beforeEach(() => {
    useAccountsStore.setState({ ...DEFAULT_ACCOUNTS_STATE });
  });

  test('starts with default accounts', () => {
    const { result } = renderHook(() => useAccountsStore());

    expect(result.current).toMatchObject(DEFAULT_ACCOUNTS_STATE);
  });

  describe('sanitizeAccounts', () => {
    it('preserves Gitea accounts with an optional port after rehydration', async () => {
      const accounts = [
        mockGiteaAccount,
        { ...mockGiteaAccount, hostname: 'gitea.example.com:3000' as Hostname },
      ];
      useAccountsStore.setState({ accounts });

      await useAccountsStore.persist.rehydrate();

      expect(useAccountsStore.getState().accounts).toEqual(accounts);
    });

    it.each(['gitea.example.com:0', 'gitea.example.com:65536', 'gitea.example.com:3000/path'])(
      'drops Gitea accounts with invalid hostname %s',
      (hostname) => {
        expect(sanitizeAccounts([{ ...mockGiteaAccount, hostname: hostname as Hostname }])).toEqual(
          [],
        );
      },
    );

    it.each<Forge>(['github', 'gitlab', 'bitbucket'])(
      'continues to reject ports for persisted %s accounts',
      (forge) => {
        expect(
          sanitizeAccounts([
            { ...mockGiteaAccount, forge, hostname: 'git.example.com:3000' as Hostname },
          ]),
        ).toEqual([]);
      },
    );

    it.each(['gitea.example.com', 'http://git.internal:3000', 'gitea.example.com:3000'])(
      'retains the Gitea account at %s on reload',
      (hostname) => {
        const account = { ...mockGiteaAccount, hostname: hostname as Hostname };
        expect(sanitizeAccounts([account])).toEqual([account]);
      },
    );

    it.each<Forge>(['github', 'gitlab', 'bitbucket'])(
      'rejects HTTP origins for persisted %s accounts',
      (forge) => {
        expect(
          sanitizeAccounts([
            { ...mockGitHubCloudAccount, forge, hostname: 'http://git.internal:3000' as Hostname },
          ]),
        ).toEqual([]);
      },
    );

    it.each(['http://git.internal/path', 'http://user:pass@git.internal', 'javascript:alert(1)'])(
      'drops invalid Gitea origin %s',
      (hostname) => {
        expect(sanitizeAccounts([{ ...mockGiteaAccount, hostname: hostname as Hostname }])).toEqual(
          [],
        );
      },
    );

    it('relabels a legacy GitHub App account as Gitify OAuth App without losing its token', () => {
      const [account] = sanitizeAccounts([
        { ...mockGitHubCloudAccount, method: 'GitHub App' as AuthMethod },
      ]);

      expect(account.method).toBe('Gitify OAuth App');
      expect(account.token).toBe(mockGitHubCloudAccount.token);
    });

    it('relabels a legacy OAuth App account as Custom OAuth App and keeps its client ID', () => {
      const [account] = sanitizeAccounts([
        { ...mockCustomOAuthAppAccount, method: 'OAuth App' as AuthMethod },
      ]);

      expect(account.method).toBe('Custom OAuth App');
      expect(account.token).toBe(mockCustomOAuthAppAccount.token);
      expect(account.clientId).toBe('CUSTOM_CLIENT_ID_123');
    });

    it('relabels a legacy OAuth App account that never stored a client ID', () => {
      const [account] = sanitizeAccounts([
        { ...mockCustomOAuthAppAccount, method: 'OAuth App' as AuthMethod, clientId: undefined },
      ]);

      expect(account.method).toBe('Custom OAuth App');
      expect(account.token).toBe(mockCustomOAuthAppAccount.token);
      expect(account.clientId).toBeUndefined();
    });

    it.each(['alice', 'mona-cat_octo'])('preserves the CLI identity for %s', (login) => {
      const [account] = sanitizeAccounts([
        {
          ...mockGitHubCliAccount,
          cliIdentity: { kind: 'account', login },
        },
      ]);

      expect(account.cliIdentity).toEqual({ kind: 'account', login });
    });

    it('preserves the environment CLI identity', () => {
      const [account] = sanitizeAccounts([
        { ...mockGitHubCliAccount, cliIdentity: { kind: 'environment' } },
      ]);

      expect(account.cliIdentity).toEqual({ kind: 'environment' });
    });

    it.each([
      { kind: 'account', login: 'not a login' },
      { kind: 'account', login: 'alice; rm -rf /' },
      { kind: 'account' },
      { kind: 'unknown' },
      { login: 'alice' },
      'alice',
    ])('drops a malformed CLI identity %o', (cliIdentity) => {
      const [account] = sanitizeAccounts([
        { ...mockGitHubCliAccount, cliIdentity: cliIdentity as never },
      ]);

      expect(account).toBeDefined();
      expect(account.cliIdentity).toBeUndefined();
    });
  });

  it.each([
    ['http://git.internal:3000', 'http://git.internal:3000/'],
    ['Gitea.Example.com', 'https://gitea.example.com:443/'],
  ])(
    'replaces the token for equivalent origins %s and %s without changing the account UUID',
    async (hostname, alias) => {
      vi.mocked(fetch).mockImplementation(
        async () => new Response(JSON.stringify({ id: 7, login: 'lan-user' })),
      );
      vi.mocked(window.gitify.encryptValue)
        .mockResolvedValueOnce('first-encrypted')
        .mockResolvedValueOnce('replacement-encrypted');
      await useAccountsStore
        .getState()
        .createAccount(
          'Personal Access Token',
          'a'.repeat(40) as Token,
          hostname as Hostname,
          'gitea',
        );
      const originalUUID = getAccountUUID(useAccountsStore.getState().accounts[0]);
      await useAccountsStore
        .getState()
        .createAccount(
          'Personal Access Token',
          'b'.repeat(40) as Token,
          alias as Hostname,
          'gitea',
        );
      const accounts = useAccountsStore.getState().accounts;
      expect(accounts).toHaveLength(1);
      expect(accounts[0].hostname).toBe(hostname);
      expect(accounts[0].token).toBe('replacement-encrypted');
      expect(getAccountUUID(accounts[0])).toBe(originalUUID);
    },
  );

  it.each([
    ['https://git.internal:3000', 7],
    ['http://git.internal:3001', 7],
    ['http://git.internal:3000', 8],
  ])('keeps a separate Gitea account for %s with user %s', async (hostname, userId) => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 7, login: 'first-user' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: userId, login: 'second-user' })));
    await useAccountsStore
      .getState()
      .createAccount(
        'Personal Access Token',
        'a'.repeat(40) as Token,
        'http://git.internal:3000' as Hostname,
        'gitea',
      );
    await useAccountsStore
      .getState()
      .createAccount(
        'Personal Access Token',
        'b'.repeat(40) as Token,
        hostname as Hostname,
        'gitea',
      );
    expect(useAccountsStore.getState().accounts).toHaveLength(2);
  });

  describe('createAccount', () => {
    vi.spyOn(logger, 'rendererLogInfo').mockImplementation(vi.fn());

    const mockAuthenticatedResponse = mockRawUser('authenticated-user');

    const fetchAuthenticatedUserDetailsSpy = vi.spyOn(apiClient, 'fetchAuthenticatedUserDetails');

    const expectedUser = () => ({
      id: String(mockAuthenticatedResponse.id),
      name: mockAuthenticatedResponse.name ?? null,
      login: mockAuthenticatedResponse.login,
      avatar: mockAuthenticatedResponse.avatar_url as Link,
    });

    describe('GitHub Cloud accounts', () => {
      beforeEach(() => {
        fetchAuthenticatedUserDetailsSpy.mockResolvedValue({
          status: 200,
          url: 'https://api.github.com/user',
          data: mockAuthenticatedResponse as GetAuthenticatedUserResponse,
          headers: {
            'x-oauth-scopes': getRecommendedScopeNames().join(', '),
          },
        });
      });

      test('adds personal access token account', async () => {
        await useAccountsStore
          .getState()
          .createAccount('Personal Access Token', '123-456' as Token, 'github.com' as Hostname);

        expect(useAccountsStore.getState().accounts).toEqual([
          {
            forge: 'github',
            hostname: 'github.com' as Hostname,
            method: 'Personal Access Token',
            platform: 'GitHub Cloud',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: expectedUser(),
            version: 'latest',
          } satisfies Account,
        ]);
      });

      test('adds a custom OAuth app account with its client ID', async () => {
        await useAccountsStore
          .getState()
          .createAccount(
            'Custom OAuth App',
            '123-456' as Token,
            'github.com' as Hostname,
            'github',
            undefined,
            'CUSTOM_CLIENT_ID_123' as ClientID,
          );

        expect(useAccountsStore.getState().accounts).toEqual([
          {
            forge: 'github',
            hostname: 'github.com' as Hostname,
            method: 'Custom OAuth App',
            clientId: 'CUSTOM_CLIENT_ID_123' as ClientID,
            platform: 'GitHub Cloud',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: expectedUser(),
            version: 'latest',
          } satisfies Account,
        ]);
      });

      test('replaces an existing account on re-authentication', async () => {
        await useAccountsStore
          .getState()
          .createAccount('Personal Access Token', '123-456' as Token, 'github.com' as Hostname);
        await useAccountsStore
          .getState()
          .createAccount('Personal Access Token', '789-000' as Token, 'github.com' as Hostname);

        expect(useAccountsStore.getState().accounts).toHaveLength(1);
      });

      test('replaces unpinned CLI accounts for the same user after validating the new login', async () => {
        const previous = { ...structuredClone(mockGitHubCliAccount), user: expectedUser() };
        const otherHost = { ...previous, hostname: mockGitHubEnterpriseServerAccount.hostname };
        useAccountsStore.setState({
          accounts: [
            previous,
            previous,
            structuredClone(previous),
            otherHost,
            mockGitHubCloudAccount,
          ],
        });
        const invalidate = vi.spyOn(getAdapter('github').accountOps, 'onAccountTokenChange');

        await useAccountsStore
          .getState()
          .createAccount('GitHub CLI', '' as Token, previous.hostname);

        expect(useAccountsStore.getState().accounts).toEqual([
          expect.objectContaining({ method: 'GitHub CLI', user: expectedUser() }),
          otherHost,
          mockGitHubCloudAccount,
        ]);
        expect(invalidate).toHaveBeenCalledWith(previous);
      });

      test('keeps CLI accounts pinned to different identities on one host', async () => {
        const alice = {
          ...structuredClone(mockGitHubCliAccount),
          user: expectedUser(),
          cliIdentity: { kind: 'account' as const, login: 'alice' },
        };
        useAccountsStore.setState({ accounts: [alice] });
        fetchAuthenticatedUserDetailsSpy.mockResolvedValueOnce({
          status: 200,
          url: 'https://api.github.com/user',
          data: { ...mockRawUser('bob'), id: 2 } as GetAuthenticatedUserResponse,
          headers: { 'x-oauth-scopes': getRecommendedScopeNames().join(', ') },
        });

        await useAccountsStore
          .getState()
          .createAccount(
            'GitHub CLI',
            '' as Token,
            alice.hostname,
            'github',
            undefined,
            undefined,
            {
              kind: 'account',
              login: 'bob',
            },
          );

        const accounts = useAccountsStore.getState().accounts;
        expect(accounts).toHaveLength(2);
        expect(accounts.map((account) => account.cliIdentity)).toEqual([
          { kind: 'account', login: 'alice' },
          { kind: 'account', login: 'bob' },
        ]);
      });

      test('updates the CLI account pinned to the same login', async () => {
        const alice = {
          ...structuredClone(mockGitHubCliAccount),
          user: expectedUser(),
          cliIdentity: { kind: 'account' as const, login: 'alice' },
        };
        useAccountsStore.setState({ accounts: [alice] });

        await useAccountsStore
          .getState()
          .createAccount(
            'GitHub CLI',
            '' as Token,
            alice.hostname,
            'github',
            undefined,
            undefined,
            {
              kind: 'account',
              login: 'ALICE',
            },
          );

        expect(useAccountsStore.getState().accounts).toHaveLength(1);
      });

      test('collapses an environment login into an existing account for the same user', async () => {
        const alice = {
          ...structuredClone(mockGitHubCliAccount),
          user: expectedUser(),
          cliIdentity: { kind: 'account' as const, login: 'alice' },
        };
        useAccountsStore.setState({ accounts: [alice] });

        await useAccountsStore
          .getState()
          .createAccount(
            'GitHub CLI',
            '' as Token,
            alice.hostname,
            'github',
            undefined,
            undefined,
            {
              kind: 'environment',
            },
          );

        const accounts = useAccountsStore.getState().accounts;
        expect(accounts).toHaveLength(1);
        expect(accounts[0].cliIdentity).toEqual({ kind: 'environment' });
      });

      test('keeps the previous CLI account when the new login fails', async () => {
        const previous = structuredClone(mockGitHubCliAccount);
        useAccountsStore.setState({ accounts: [previous] });
        fetchAuthenticatedUserDetailsSpy.mockRejectedValueOnce(new Error('CLI login failed'));

        await expect(
          useAccountsStore.getState().createAccount('GitHub CLI', '' as Token, previous.hostname),
        ).rejects.toThrow('CLI login failed');

        expect(useAccountsStore.getState().accounts).toEqual([previous]);
      });

      test('does not enroll a CLI token without notification access', async () => {
        fetchAuthenticatedUserDetailsSpy.mockResolvedValueOnce({
          status: 200,
          url: 'https://api.github.com/user',
          data: mockAuthenticatedResponse as GetAuthenticatedUserResponse,
          headers: { 'x-oauth-scopes': 'public_repo, read:org' },
        });

        await expect(
          useAccountsStore
            .getState()
            .createAccount('GitHub CLI', '' as Token, mockGitHubCliAccount.hostname),
        ).rejects.toThrow('gh auth refresh -s notifications');
        expect(useAccountsStore.getState().accounts).toEqual([]);
      });
    });

    describe('GitHub Enterprise Server accounts', () => {
      beforeEach(() => {
        fetchAuthenticatedUserDetailsSpy.mockResolvedValue({
          status: 200,
          url: 'https://github.gitify.io/api/v3/user',
          data: mockAuthenticatedResponse as GetAuthenticatedUserResponse,
          headers: {
            'x-github-enterprise-version': '3.0.0',
            'x-oauth-scopes': getRecommendedScopeNames().join(', '),
          },
        });
      });

      test('adds personal access token account', async () => {
        await useAccountsStore
          .getState()
          .createAccount(
            'Personal Access Token',
            '123-456' as Token,
            'github.gitify.io' as Hostname,
          );

        expect(useAccountsStore.getState().accounts).toEqual([
          {
            forge: 'github',
            hostname: 'github.gitify.io' as Hostname,
            method: 'Personal Access Token',
            platform: 'GitHub Enterprise Server',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: expectedUser(),
            version: '3.0.0',
          } satisfies Account,
        ]);
      });

      test('adds a custom OAuth app account', async () => {
        await useAccountsStore
          .getState()
          .createAccount(
            'Custom OAuth App',
            '123-456' as Token,
            'github.gitify.io' as Hostname,
            'github',
            undefined,
            'CUSTOM_CLIENT_ID_123' as ClientID,
          );

        expect(useAccountsStore.getState().accounts).toEqual([
          {
            forge: 'github',
            hostname: 'github.gitify.io' as Hostname,
            method: 'Custom OAuth App',
            clientId: 'CUSTOM_CLIENT_ID_123' as ClientID,
            platform: 'GitHub Enterprise Server',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: expectedUser(),
            version: '3.0.0',
          } satisfies Account,
        ]);
      });
    });
  });

  describe('refreshAccount', () => {
    it('pins a legacy CLI account in place without changing its UUID', async () => {
      const legacy = {
        ...structuredClone(mockGitHubCliAccount),
        user: { id: '1', login: 'octocat', name: 'Mona Lisa Octocat', avatar: null },
      };
      useAccountsStore.setState({ accounts: [legacy] });
      const originalUUID = getAccountUUID(legacy);
      const listSpy = vi.spyOn(comms, 'listGitHubCliAccounts').mockResolvedValueOnce({
        accounts: [{ identity: { kind: 'account', login: 'authenticated-user' }, active: true }],
      });

      const refreshed = await useAccountsStore.getState().refreshAccount(legacy);

      expect(listSpy).toHaveBeenCalledWith(legacy.hostname);
      expect(refreshed.cliIdentity).toEqual({ kind: 'account', login: 'authenticated-user' });
      expect(getAccountUUID(refreshed)).toBe(originalUUID);
      expect(useAccountsStore.getState().accounts).toHaveLength(1);
    });

    it('leaves an already pinned account alone', async () => {
      const pinned = {
        ...structuredClone(mockGitHubCliAccount),
        user: { id: '1', login: 'octocat', name: 'Mona Lisa Octocat', avatar: null },
        cliIdentity: { kind: 'account' as const, login: 'alice' },
      };
      useAccountsStore.setState({ accounts: [pinned] });
      const listSpy = vi.spyOn(comms, 'listGitHubCliAccounts');

      await useAccountsStore.getState().refreshAccount(pinned);

      expect(listSpy).not.toHaveBeenCalled();
      expect(pinned.cliIdentity).toEqual({ kind: 'account', login: 'alice' });
    });
  });

  describe('removeAccount', () => {
    test('removes an account', () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useAccountsStore());

      act(() => {
        result.current.removeAccount(mockGitHubCloudAccount);
      });

      expect(result.current.accounts).toHaveLength(1);
      expect(result.current.accounts[0]).toEqual(mockGitHubEnterpriseServerAccount);
    });

    test('does not remove account if not found', () => {
      useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

      const { result } = renderHook(() => useAccountsStore());

      act(() => {
        result.current.removeAccount(mockGitHubEnterpriseServerAccount);
      });

      expect(result.current.accounts).toHaveLength(1);
      expect(result.current.accounts[0]).toEqual(mockGitHubCloudAccount);
    });
  });

  describe('isLoggedIn', () => {
    test('returns false when no accounts are present', () => {
      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.isLoggedIn()).toBe(false);
    });

    test('returns true when accounts are present', () => {
      useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.isLoggedIn()).toBe(true);
    });
  });

  describe('hasMultipleAccounts', () => {
    test('returns false when zero or one account is present', () => {
      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.hasMultipleAccounts()).toBe(false);

      act(() => {
        useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
      });

      expect(result.current.hasMultipleAccounts()).toBe(false);
    });

    test('returns true when more than one account is present', () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.hasMultipleAccounts()).toBe(true);
    });
  });

  describe('primaryAccount', () => {
    test('returns the first (primary) account when multiple', () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.primaryAccount()).toBe(mockGitHubCloudAccount);
    });

    test('returns the account when one is present', () => {
      useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.primaryAccount()).toBe(mockGitHubCloudAccount);
    });

    test('returns undefined when no accounts are present', () => {
      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.primaryAccount()).toBeUndefined();
    });
  });

  describe('reset', () => {
    test('resets accounts to default', () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useAccountsStore());

      act(() => {
        result.current.reset();
      });

      expect(result.current).toMatchObject(DEFAULT_ACCOUNTS_STATE);
      expect(result.current.accounts).toEqual([]);
    });

    test('drops forge client state for every account', () => {
      const onAccountTokenChangeSpy = vi
        .spyOn(getAdapter(mockGitHubCloudAccount).accountOps, 'onAccountTokenChange')
        .mockImplementation(vi.fn());

      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useAccountsStore());

      act(() => {
        result.current.reset();
      });

      expect(onAccountTokenChangeSpy).toHaveBeenCalledTimes(2);
      expect(onAccountTokenChangeSpy).toHaveBeenCalledWith(mockGitHubCloudAccount);
      expect(onAccountTokenChangeSpy).toHaveBeenCalledWith(mockGitHubEnterpriseServerAccount);
    });
  });
});
