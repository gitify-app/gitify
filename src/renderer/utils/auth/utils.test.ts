import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockAuth } from '../../__mocks__/state-mocks';
import { mockRawUser } from '../api/__mocks__/response-mocks';

import { Constants } from '../../constants';

import type {
  Account,
  AuthState,
  ClientID,
  Hostname,
  Link,
  Token,
} from '../../types';
import type { GetAuthenticatedUserResponse } from '../api/types';
import type { AuthMethod } from './types';

import * as apiClient from '../api/client';
import * as logger from '../core/logger';
import { getRecommendedScopeNames } from './scopes';
import * as authUtils from './utils';
import {
  getGitHubAuthBaseUrl,
  getNewOAuthAppURL,
  getNewTokenURL,
} from './utils';

describe('renderer/utils/auth/utils.ts', () => {
  vi.spyOn(logger, 'rendererLogInfo').mockImplementation(vi.fn());

  beforeEach(() => {
    // Mock OAUTH_DEVICE_FLOW_CLIENT_ID value
    Constants.OAUTH_DEVICE_FLOW_CLIENT_ID = 'FAKE_CLIENT_ID_123' as ClientID;
  });

  describe('addAccount', () => {
    let mockAuthState: AuthState;

    const mockAuthenticatedResponse = mockRawUser('authenticated-user');

    const fetchAuthenticatedUserDetailsSpy = vi.spyOn(
      apiClient,
      'fetchAuthenticatedUserDetails',
    );

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
            hostname: 'github.com' as Hostname,
            method: 'Personal Access Token',
            platform: 'GitHub Cloud',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name as string | null,
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
            hostname: 'github.com' as Hostname,
            method: 'OAuth App',
            platform: 'GitHub Cloud',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name as string | null,
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
            hostname: 'github.gitify.io' as Hostname,
            method: 'Personal Access Token',
            platform: 'GitHub Enterprise Server',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name as string | null,
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
            hostname: 'github.gitify.io' as Hostname,
            method: 'OAuth App',
            platform: 'GitHub Enterprise Server',
            scopes: getRecommendedScopeNames(),
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name as string | null,
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

  it('extractHostVersion', () => {
    expect(authUtils.extractHostVersion(null)).toBe('latest');

    expect(authUtils.extractHostVersion('foo')).toBeUndefined();

    expect(authUtils.extractHostVersion('3')).toBe('3.0.0');

    expect(authUtils.extractHostVersion('3.15')).toBe('3.15.0');

    expect(authUtils.extractHostVersion('3.15.0')).toBe('3.15.0');

    expect(authUtils.extractHostVersion('3.15.0-beta1')).toBe('3.15.0');

    expect(authUtils.extractHostVersion('enterprise-server@3')).toBe('3.0.0');

    expect(authUtils.extractHostVersion('enterprise-server@3.15')).toBe(
      '3.15.0',
    );

    expect(authUtils.extractHostVersion('enterprise-server@3.15.0')).toBe(
      '3.15.0',
    );

    expect(authUtils.extractHostVersion('enterprise-server@3.15.0-beta1')).toBe(
      '3.15.0',
    );
  });

  describe('getGitHubAuthBaseUrl', () => {
    it('should generate a GitHub Auth url - non enterprise', () => {
      const result = getGitHubAuthBaseUrl('github.com' as Hostname);
      expect(result.toString()).toBe('https://github.com/');
    });

    it('should generate a GitHub Auth url - enterprise', () => {
      const result = getGitHubAuthBaseUrl('github.gitify.io' as Hostname);
      expect(result.toString()).toBe('https://github.gitify.io/api/v3/');
    });

    it('should generate a GitHub Auth url - data residency', () => {
      const result = getGitHubAuthBaseUrl('gitify.ghe.com' as Hostname);
      expect(result.toString()).toBe('https://api.gitify.ghe.com/');
    });
  });

  it('getDeveloperSettingsURL', () => {
    expect(
      authUtils.getDeveloperSettingsURL({
        hostname: 'github.com' as Hostname,
        method: 'GitHub App',
      } as Account),
    ).toBe(
      'https://github.com/settings/connections/applications/FAKE_CLIENT_ID_123',
    );

    expect(
      authUtils.getDeveloperSettingsURL({
        hostname: 'github.com' as Hostname,
        method: 'OAuth App',
      } as Account),
    ).toBe('https://github.com/settings/developers');

    expect(
      authUtils.getDeveloperSettingsURL({
        hostname: 'github.com' as Hostname,
        method: 'Personal Access Token',
      } as Account),
    ).toBe('https://github.com/settings/tokens');

    expect(
      authUtils.getDeveloperSettingsURL({
        hostname: 'github.com',
        method: 'unknown' as AuthMethod,
      } as Account),
    ).toBe('https://github.com/settings');
  });

  describe('getNewTokenURL', () => {
    it('should generate new PAT url - github cloud', () => {
      expect(
        getNewTokenURL('github.com' as Hostname).startsWith(
          'https://github.com/settings/tokens/new',
        ),
      ).toBeTruthy();
    });

    it('should generate new PAT url - github server', () => {
      expect(
        getNewTokenURL('github.gitify.io' as Hostname).startsWith(
          'https://github.gitify.io/settings/tokens/new',
        ),
      ).toBeTruthy();
    });
  });

  describe('getNewOAuthAppURL', () => {
    it('should generate new oauth app url - github cloud', () => {
      expect(
        getNewOAuthAppURL('github.com' as Hostname).startsWith(
          'https://github.com/settings/applications/new',
        ),
      ).toBeTruthy();
    });

    it('should generate new oauth app url - github server', () => {
      expect(
        getNewOAuthAppURL('github.gitify.io' as Hostname).startsWith(
          'https://github.gitify.io/settings/applications/new',
        ),
      ).toBeTruthy();
    });
  });

  describe('isValidHostname', () => {
    it('should validate hostname - github cloud', () => {
      expect(authUtils.isValidHostname('github.com' as Hostname)).toBeTruthy();
    });

    it('should validate hostname - github enterprise server', () => {
      expect(
        authUtils.isValidHostname('github.gitify.io' as Hostname),
      ).toBeTruthy();
    });

    it('should invalidate hostname - empty', () => {
      expect(authUtils.isValidHostname('' as Hostname)).toBeFalsy();
    });

    it('should invalidate hostname - invalid', () => {
      expect(authUtils.isValidHostname('github' as Hostname)).toBeFalsy();
    });
  });

  describe('isValidClientId', () => {
    it('should validate client id - valid', () => {
      expect(
        authUtils.isValidClientId('1234567890_ASDFGHJKL' as ClientID),
      ).toBeTruthy();
    });

    it('should validate client id - empty', () => {
      expect(authUtils.isValidClientId('' as ClientID)).toBeFalsy();
    });

    it('should validate client id - invalid', () => {
      expect(
        authUtils.isValidClientId('1234567890asdfg' as ClientID),
      ).toBeFalsy();
    });
  });

  describe('isValidToken', () => {
    it('should validate token - valid', () => {
      expect(
        authUtils.isValidToken(
          '1234567890_asdfghjklPOIUYTREWQ0987654321' as Token,
        ),
      ).toBeTruthy();
    });

    it('should validate token - empty', () => {
      expect(authUtils.isValidToken('' as Token)).toBeFalsy();
    });

    it('should validate token - invalid', () => {
      expect(authUtils.isValidToken('1234567890asdfg' as Token)).toBeFalsy();
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
      expect(authUtils.getPrimaryAccountHostname(mockAuth)).toBe(
        mockGitHubCloudAccount.hostname,
      );
    });

    it('should use default hostname if no accounts', () => {
      expect(authUtils.getPrimaryAccountHostname({ accounts: [] })).toBe(
        Constants.GITHUB_HOSTNAME,
      );
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
