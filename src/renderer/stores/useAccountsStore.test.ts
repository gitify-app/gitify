import { act, renderHook } from '@testing-library/react';

import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';
import { mockRawUser } from '../utils/forges/github/__mocks__/response-mocks';

import type { Account, Hostname, Link, Token } from '../types';
import type { GetAuthenticatedUserResponse } from '../utils/forges/github/types';

import { getRecommendedScopeNames } from '../utils/auth/scopes';
import * as logger from '../utils/core/logger';
import * as apiClient from '../utils/forges/github/client';
import { DEFAULT_ACCOUNTS_STATE } from './defaults';
import useAccountsStore from './useAccountsStore';

describe('renderer/stores/useAccountsStore.ts', () => {
  beforeEach(() => {
    useAccountsStore.setState({ ...DEFAULT_ACCOUNTS_STATE });
  });

  test('should start with default accounts', () => {
    const { result } = renderHook(() => useAccountsStore());

    expect(result.current).toMatchObject(DEFAULT_ACCOUNTS_STATE);
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
  });
});
