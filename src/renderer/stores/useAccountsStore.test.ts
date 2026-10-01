import { act, renderHook } from '@testing-library/react';

import {
  mockGiteaAccount,
  mockGitHubCliAccount,
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';
import { mockRawUser } from '../utils/forges/github/__mocks__/response-mocks';

import type { Account, Forge, Hostname, Link, Token } from '../types';
import type { GetAuthenticatedUserResponse } from '../utils/forges/github/types';

import { getRecommendedScopeNames } from '../utils/auth/scopes';
import * as logger from '../utils/core/logger';
import * as apiClient from '../utils/forges/github/client';
import { getAdapter } from '../utils/forges/registry';
import { DEFAULT_ACCOUNTS_STATE } from './defaults';
import useAccountsStore, { sanitizeAccounts } from './useAccountsStore';

describe('renderer/stores/useAccountsStore.ts', () => {
  beforeEach(() => {
    useAccountsStore.setState({ ...DEFAULT_ACCOUNTS_STATE });
  });

  test('should start with default accounts', () => {
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

      test('should add personal access token account', async () => {
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

      test('should add oauth app account', async () => {
        await useAccountsStore
          .getState()
          .createAccount('OAuth App', '123-456' as Token, 'github.com' as Hostname);

        expect(useAccountsStore.getState().accounts).toEqual([
          {
            forge: 'github',
            hostname: 'github.com' as Hostname,
            method: 'OAuth App',
            platform: 'GitHub Cloud',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: expectedUser(),
            version: 'latest',
          } satisfies Account,
        ]);
      });

      test('should replace an existing account on re-authentication', async () => {
        await useAccountsStore
          .getState()
          .createAccount('Personal Access Token', '123-456' as Token, 'github.com' as Hostname);
        await useAccountsStore
          .getState()
          .createAccount('Personal Access Token', '789-000' as Token, 'github.com' as Hostname);

        expect(useAccountsStore.getState().accounts).toHaveLength(1);
      });

      test('replaces all CLI accounts for the host after validating the new user', async () => {
        const previous = structuredClone(mockGitHubCliAccount);
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

      test('keeps the previous CLI account when the new login fails', async () => {
        const previous = structuredClone(mockGitHubCliAccount);
        useAccountsStore.setState({ accounts: [previous] });
        fetchAuthenticatedUserDetailsSpy.mockRejectedValueOnce(new Error('CLI login failed'));

        await expect(
          useAccountsStore.getState().createAccount('GitHub CLI', '' as Token, previous.hostname),
        ).rejects.toThrow('CLI login failed');

        expect(useAccountsStore.getState().accounts).toEqual([previous]);
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

      test('should add personal access token account', async () => {
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

      test('should add oauth app account', async () => {
        await useAccountsStore
          .getState()
          .createAccount('OAuth App', '123-456' as Token, 'github.gitify.io' as Hostname);

        expect(useAccountsStore.getState().accounts).toEqual([
          {
            forge: 'github',
            hostname: 'github.gitify.io' as Hostname,
            method: 'OAuth App',
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

  describe('removeAccount', () => {
    test('should remove an account', () => {
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

    test('should not remove account if not found', () => {
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
    test('should return false when no accounts are present', () => {
      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.isLoggedIn()).toBe(false);
    });

    test('should return true when accounts are present', () => {
      useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.isLoggedIn()).toBe(true);
    });
  });

  describe('hasMultipleAccounts', () => {
    test('should return false when zero or one account is present', () => {
      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.hasMultipleAccounts()).toBe(false);

      act(() => {
        useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
      });

      expect(result.current.hasMultipleAccounts()).toBe(false);
    });

    test('should return true when more than one account is present', () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.hasMultipleAccounts()).toBe(true);
    });
  });

  describe('primaryAccount', () => {
    test('should return the first (primary) account when multiple', () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.primaryAccount()).toBe(mockGitHubCloudAccount);
    });

    test('should return the account when one is present', () => {
      useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.primaryAccount()).toBe(mockGitHubCloudAccount);
    });

    test('should return undefined when no accounts are present', () => {
      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.primaryAccount()).toBeUndefined();
    });
  });

  describe('reset', () => {
    test('should reset accounts to default', () => {
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

    test('should drop forge client state for every account', () => {
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
