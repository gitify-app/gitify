// Use a hoist-safe mock factory for '@octokit/oauth-methods'
vi.mock('@octokit/oauth-methods', async () => {
  const actual = await vi.importActual<typeof import('@octokit/oauth-methods')>(
    '@octokit/oauth-methods',
  );
  return {
    ...actual,
    createDeviceCode: vi.fn(),
    exchangeDeviceCode: vi.fn(),
    exchangeWebFlowCode: vi.fn(),
  };
});

import {
  createDeviceCode,
  exchangeDeviceCode,
  exchangeWebFlowCode,
} from '@octokit/oauth-methods';

import type { MockedFunction } from 'vitest';

import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockAuth } from '../../__mocks__/state-mocks';
import { mockRawUser } from '../api/__mocks__/response-mocks';

import { Constants } from '../../constants';

import type {
  Account,
  AuthCode,
  AuthState,
  ClientID,
  ClientSecret,
  Hostname,
  Link,
  Token,
} from '../../types';
import type { GetAuthenticatedUserResponse } from '../api/types';
import type { AuthMethod, LoginOAuthWebOptions } from './types';

import * as comms from '../../utils/comms';
import * as apiClient from '../api/client';
import * as logger from '../logger';
import * as authUtils from './utils';
import {
  getGitHubAuthBaseUrl,
  getNewOAuthAppURL,
  getNewTokenURL,
} from './utils';

const createDeviceCodeMock = createDeviceCode as unknown as MockedFunction<
  typeof createDeviceCode
>;

const exchangeDeviceCodeMock = exchangeDeviceCode as unknown as MockedFunction<
  typeof exchangeDeviceCode
>;

const exchangeWebFlowCodeMock =
  exchangeWebFlowCode as unknown as MockedFunction<typeof exchangeWebFlowCode>;

describe('renderer/utils/auth/utils.ts', () => {
  vi.spyOn(logger, 'rendererLogInfo').mockImplementation(vi.fn());
  const openExternalLinkSpy = vi
    .spyOn(comms, 'openExternalLink')
    .mockImplementation(vi.fn());

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('performGitHubDeviceOAuth', () => {
    beforeEach(() => {
      // Mock OAUTH_DEVICE_FLOW_CLIENT_ID value
      Constants.OAUTH_DEVICE_FLOW_CLIENT_ID = 'FAKE_CLIENT_ID_123' as ClientID;
    });

    it('should authenticate using device flow for GitHub app', async () => {
      createDeviceCodeMock.mockResolvedValueOnce({
        data: {
          device_code: 'device-code',
          user_code: 'user-code',
          verification_uri: 'https://github.com/login/device',
          expires_in: 900,
          interval: 5,
        },
      } as unknown as Awaited<ReturnType<typeof createDeviceCode>>);

      exchangeDeviceCodeMock.mockResolvedValueOnce({
        authentication: {
          token: 'device-token',
        },
      } as unknown as Awaited<ReturnType<typeof exchangeDeviceCode>>);

      const token = await authUtils.performGitHubDeviceOAuth();

      expect(createDeviceCodeMock).toHaveBeenCalledWith({
        clientType: 'oauth-app',
        clientId: 'FAKE_CLIENT_ID_123',
        scopes: Constants.OAUTH_SCOPES.RECOMMENDED,
        request: expect.any(Function),
      });

      expect(exchangeDeviceCodeMock).toHaveBeenCalledWith({
        clientType: 'oauth-app',
        clientId: 'FAKE_CLIENT_ID_123',
        code: 'device-code',
        request: expect.any(Function),
      });

      expect(token).toBe('device-token');
    });
  });

  describe('performGitHubWebOAuth', () => {
    const webAuthOptions: LoginOAuthWebOptions = {
      hostname: 'github.com' as Hostname,
      clientId: 'FAKE_CLIENT_ID_123' as ClientID,
      clientSecret: 'FAKE_CLIENT_SECRET_123' as ClientSecret,
    };

    it('should call performGitHubWebOAuth using custom oauth app - success oauth flow', async () => {
      window.gitify.onAuthCallback = vi.fn().mockImplementation((callback) => {
        callback('gitify://oauth?code=123-456');
      });

      const res = await authUtils.performGitHubWebOAuth({
        clientId: 'BYO_CLIENT_ID' as ClientID,
        clientSecret: 'BYO_CLIENT_SECRET' as ClientSecret,
        hostname: 'my.git.com' as Hostname,
      });

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://my.git.com/login/oauth/authorize?allow_signup=false&client_id=BYO_CLIENT_ID&scope=read%3Auser%2Cnotifications%2Crepo',
        ),
      );

      expect(window.gitify.onAuthCallback).toHaveBeenCalledTimes(1);
      expect(window.gitify.onAuthCallback).toHaveBeenCalledWith(
        expect.any(Function),
      );

      expect(res.authMethod).toBe('OAuth App');
      expect(res.authCode).toBe('123-456');
    });

    it('should call performGitHubWebOAuth - failure', async () => {
      window.gitify.onAuthCallback = vi.fn().mockImplementation((callback) => {
        callback(
          'gitify://auth?error=invalid_request&error_description=The+redirect_uri+is+missing+or+invalid.&error_uri=https://docs.github.com/en/developers/apps/troubleshooting-oauth-errors',
        );
      });

      await expect(
        async () => await authUtils.performGitHubWebOAuth(webAuthOptions),
      ).rejects.toEqual(
        new Error(
          "Oops! Something went wrong and we couldn't log you in using GitHub. Please try again. Reason: The redirect_uri is missing or invalid. Docs: https://docs.github.com/en/developers/apps/troubleshooting-oauth-errors",
        ),
      );

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://github.com/login/oauth/authorize?allow_signup=false&client_id=FAKE_CLIENT_ID_123&scope=read%3Auser%2Cnotifications%2Crepo',
        ),
      );

      expect(window.gitify.onAuthCallback).toHaveBeenCalledTimes(1);
      expect(window.gitify.onAuthCallback).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    describe('exchangeAuthCodeForAccessToken', () => {
      const authCode = '123-456' as AuthCode;

      it('should exchange auth code for access token', async () => {
        exchangeWebFlowCodeMock.mockResolvedValueOnce({
          authentication: {
            token: 'this-is-a-token',
          },
        } as unknown as Awaited<ReturnType<typeof exchangeWebFlowCode>>);

        const res = await authUtils.exchangeAuthCodeForAccessToken(authCode, {
          ...webAuthOptions,
        });

        expect(exchangeWebFlowCodeMock).toHaveBeenCalledWith({
          clientType: 'oauth-app',
          clientId: 'FAKE_CLIENT_ID_123',
          clientSecret: 'FAKE_CLIENT_SECRET_123',
          code: '123-456',
          request: expect.any(Function),
        });
        expect(res).toBe('this-is-a-token');
      });

      it('should throw when client secret is missing', async () => {
        await expect(
          async () =>
            await authUtils.exchangeAuthCodeForAccessToken(authCode, {
              ...webAuthOptions,
              clientSecret: undefined as unknown as ClientSecret,
            }),
        ).rejects.toThrow('clientSecret is required to exchange an auth code');
      });
    });
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
            'x-oauth-scopes': Constants.OAUTH_SCOPES.RECOMMENDED.join(', '),
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
            hasRequiredScopes: true,
            hostname: 'github.com' as Hostname,
            method: 'Personal Access Token',
            platform: 'GitHub Cloud',
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name,
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
            hasRequiredScopes: true,
            hostname: 'github.com' as Hostname,
            method: 'OAuth App',
            platform: 'GitHub Cloud',
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name,
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
            'x-oauth-scopes': Constants.OAUTH_SCOPES.RECOMMENDED.join(', '),
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
            hasRequiredScopes: true,
            hostname: 'github.gitify.io' as Hostname,
            method: 'Personal Access Token',
            platform: 'GitHub Enterprise Server',
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name,
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
            hasRequiredScopes: true,
            hostname: 'github.gitify.io' as Hostname,
            method: 'OAuth App',
            platform: 'GitHub Enterprise Server',
            token: 'encrypted' as Token,
            user: {
              id: String(mockAuthenticatedResponse.id),
              name: mockAuthenticatedResponse.name,
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

    expect(authUtils.extractHostVersion('foo')).toBe(null);

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
      'https://github.com/settings/connections/applications/27a352516d3341cee376',
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
