import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockAuth } from '../../__mocks__/state-mocks';
import { mockRawUser } from '../forges/github/__mocks__/response-mocks';

import { Constants } from '../../constants';

import type { Account, AuthState, Hostname, Link, Token } from '../../types';
import type { GetAuthenticatedUserResponse } from '../forges/github/types';

import * as logger from '../core/logger';
import * as apiClient from '../forges/github/client';
import { getRecommendedScopeNames } from './scopes';
import * as authUtils from './utils';

describe('renderer/utils/auth/utils.ts', () => {
  vi.spyOn(logger, 'rendererLogInfo').mockImplementation(vi.fn());

  describe('addAccount', () => {
    let mockAuthState: AuthState;

    const mockAuthenticatedResponse = mockRawUser('authenticated-user');

    const fetchAuthenticatedUserDetailsSpy = vi.spyOn(apiClient, 'fetchAuthenticatedUserDetails');

    beforeEach(() => {
      mockAuthState = {
        accounts: [],
      };
    });

    describe('should add GitHub Cloud account', () => {
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

      it('should add personal access token account', async () => {
        const result = await authUtils.addAccount(
          mockAuthState,
          'Personal Access Token',
          '123-456' as Token,
          'github.com' as Hostname,
        );

        expect(result.accounts).toEqual([
          {
            forge: 'github',
            hostname: 'github.com' as Hostname,
            method: 'Personal Access Token',
            platform: 'GitHub Cloud',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name ?? null,
              login: mockAuthenticatedResponse.login,
              avatar: mockAuthenticatedResponse.avatar_url as Link,
            },
            version: 'latest',
          } satisfies Account,
        ]);
      });

      it('should add oauth app account', async () => {
        const result = await authUtils.addAccount(
          mockAuthState,
          'OAuth App',
          '123-456' as Token,
          'github.com' as Hostname,
        );

        expect(result.accounts).toEqual([
          {
            forge: 'github',
            hostname: 'github.com' as Hostname,
            method: 'OAuth App',
            platform: 'GitHub Cloud',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name ?? null,
              login: mockAuthenticatedResponse.login,
              avatar: mockAuthenticatedResponse.avatar_url as Link,
            },
            version: 'latest',
          } satisfies Account,
        ]);
      });
    });

    describe('should add GitHub Enterprise Server account', () => {
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

      it('should add personal access token account', async () => {
        const result = await authUtils.addAccount(
          mockAuthState,
          'Personal Access Token',
          '123-456' as Token,
          'github.gitify.io' as Hostname,
        );

        expect(result.accounts).toEqual([
          {
            forge: 'github',
            hostname: 'github.gitify.io' as Hostname,
            method: 'Personal Access Token',
            platform: 'GitHub Enterprise Server',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name ?? null,
              login: mockAuthenticatedResponse.login,
              avatar: mockAuthenticatedResponse.avatar_url as Link,
            },
            version: '3.0.0',
          } satisfies Account,
        ]);
      });

      it('should add oauth app account', async () => {
        const result = await authUtils.addAccount(
          mockAuthState,
          'OAuth App',
          '123-456' as Token,
          'github.gitify.io' as Hostname,
        );

        expect(result.accounts).toEqual([
          {
            forge: 'github',
            hostname: 'github.gitify.io' as Hostname,
            method: 'OAuth App',
            platform: 'GitHub Enterprise Server',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name ?? null,
              login: mockAuthenticatedResponse.login,
              avatar: mockAuthenticatedResponse.avatar_url as Link,
            },
            version: '3.0.0',
          } satisfies Account,
        ]);
      });
    });
  });

  describe('removeAccount', () => {
    it('should remove account with matching token', async () => {
      expect(mockAuth.accounts.length).toBe(2);

      const result = authUtils.removeAccount(mockAuth, mockGitHubCloudAccount);

      expect(result.accounts.length).toBe(1);
    });

    it('should do nothing if no accounts match', async () => {
      const mockAccount = {
        token: 'unknown-token',
      } as Account;

      expect(mockAuth.accounts.length).toBe(2);

      const result = authUtils.removeAccount(mockAuth, mockAccount);

      expect(result.accounts.length).toBe(2);
    });
  });

  describe('isValidHostname', () => {
    it('should validate hostname - github cloud', () => {
      expect(authUtils.isValidHostname('github.com' as Hostname)).toBeTruthy();
    });

    it('should validate hostname - github enterprise server', () => {
      expect(authUtils.isValidHostname('github.gitify.io' as Hostname)).toBeTruthy();
    });

    it('should invalidate hostname - empty', () => {
      expect(authUtils.isValidHostname('' as Hostname)).toBeFalsy();
    });

    it('should invalidate hostname - invalid', () => {
      expect(authUtils.isValidHostname('github' as Hostname)).toBeFalsy();
    });
  });

  describe('getAccountUUID', () => {
    it('should validate account uuid', () => {
      expect(authUtils.getAccountUUID(mockGitHubCloudAccount)).toBe(
        'Z2l0aHViLmNvbS0xMjM0NTY3ODktUGVyc29uYWwgQWNjZXNzIFRva2Vu',
      );
    });
  });

  describe('getPrimaryAccountHostname', () => {
    it('should return first (primary) account hostname when multiple', () => {
      expect(authUtils.getPrimaryAccountHostname(mockAuth)).toBe(mockGitHubCloudAccount.hostname);
    });

    it('should use default hostname if no accounts', () => {
      expect(authUtils.getPrimaryAccountHostname({ accounts: [] })).toBe(Constants.GITHUB_HOSTNAME);
    });
  });

  describe('hasAccounts', () => {
    it('should return true', () => {
      expect(authUtils.hasAccounts(mockAuth)).toBeTruthy();
    });

    it('should validate false', () => {
      expect(
        authUtils.hasAccounts({
          accounts: [],
        }),
      ).toBeFalsy();
    });
  });

  describe('hasMultipleAccounts', () => {
    it('should return true', () => {
      expect(authUtils.hasMultipleAccounts(mockAuth)).toBeTruthy();
    });

    it('should validate false', () => {
      expect(
        authUtils.hasMultipleAccounts({
          accounts: [],
        }),
      ).toBeFalsy();
      expect(
        authUtils.hasMultipleAccounts({
          accounts: [mockGitHubCloudAccount],
        }),
      ).toBeFalsy();
    });
  });
});
