import type { AxiosResponse } from 'axios';
import axios from 'axios';

import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockAuth } from '../../__mocks__/state-mocks';
import { mockGitifyUser } from '../../__mocks__/user-mocks';
import { Constants } from '../../constants';
import type {
  Account,
  AuthCode,
  AuthState,
  ClientID,
  ClientSecret,
  Hostname,
  Token,
} from '../../types';
import * as comms from '../../utils/comms';
import * as apiClient from '../api/client';
import type { FetchAuthenticatedUserDetailsQuery } from '../api/graphql/generated/graphql';
import * as apiRequests from '../api/request';
import * as logger from '../logger';
import type { AuthMethod } from './types';
import * as authUtils from './utils';
import { getNewOAuthAppURL, getNewTokenURL } from './utils';

type UserDetailsResponse = FetchAuthenticatedUserDetailsQuery['viewer'];

describe('renderer/utils/auth/utils.ts', () => {
  describe('authGitHub', () => {
    vi.spyOn(logger, 'rendererLogInfo').mockImplementation(() => {});
    const openExternalLinkSpy = vi
      .spyOn(comms, 'openExternalLink')
      .mockImplementation(() => {});

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should call authGitHub - success auth flow', async () => {
      window.gitify.onAuthCallback = vi.fn().mockImplementation((callback) => {
        callback('gitify://auth?code=123-456');
      });

      const res = await authUtils.authGitHub();

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        'https://github.com/login/oauth/authorize?client_id=FAKE_CLIENT_ID_123&scope=read%3Auser%2Cnotifications%2Crepo',
      );

      expect(window.gitify.onAuthCallback).toHaveBeenCalledTimes(1);
      expect(window.gitify.onAuthCallback).toHaveBeenCalledWith(
        expect.any(Function),
      );

      expect(res.authMethod).toBe('GitHub App');
      expect(res.authCode).toBe('123-456');
    });

    it('should call authGitHub - success oauth flow', async () => {
      window.gitify.onAuthCallback = vi.fn().mockImplementation((callback) => {
        callback('gitify://oauth?code=123-456');
      });

      const res = await authUtils.authGitHub({
        clientId: 'BYO_CLIENT_ID' as ClientID,
        clientSecret: 'BYO_CLIENT_SECRET' as ClientSecret,
        hostname: 'my.git.com' as Hostname,
      });

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        'https://my.git.com/login/oauth/authorize?client_id=BYO_CLIENT_ID&scope=read%3Auser%2Cnotifications%2Crepo',
      );

      expect(window.gitify.onAuthCallback).toHaveBeenCalledTimes(1);
      expect(window.gitify.onAuthCallback).toHaveBeenCalledWith(
        expect.any(Function),
      );

      expect(res.authMethod).toBe('OAuth App');
      expect(res.authCode).toBe('123-456');
    });

    it('should call authGitHub - failure', async () => {
      window.gitify.onAuthCallback = vi.fn().mockImplementation((callback) => {
        callback(
          'gitify://auth?error=invalid_request&error_description=The+redirect_uri+is+missing+or+invalid.&error_uri=https://docs.github.com/en/developers/apps/troubleshooting-oauth-errors',
        );
      });

      await expect(async () => await authUtils.authGitHub()).rejects.toEqual(
        new Error(
          "Oops! Something went wrong and we couldn't log you in using GitHub. Please try again. Reason: The redirect_uri is missing or invalid. Docs: https://docs.github.com/en/developers/apps/troubleshooting-oauth-errors",
        ),
      );

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        'https://github.com/login/oauth/authorize?client_id=FAKE_CLIENT_ID_123&scope=read%3Auser%2Cnotifications%2Crepo',
      );

      expect(window.gitify.onAuthCallback).toHaveBeenCalledTimes(1);
      expect(window.gitify.onAuthCallback).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });
  });

  describe('getToken', () => {
    const authCode = '123-456' as AuthCode;
    const apiRequestSpy = vi.spyOn(apiRequests, 'apiRequest');

    it('should get a token', async () => {
      apiRequestSpy.mockResolvedValueOnce({
        data: { access_token: 'this-is-a-token' },
      } as AxiosResponse);

      const res = await authUtils.getToken(authCode);

      expect(apiRequests.apiRequest).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        'POST',
        {
          client_id: 'FAKE_CLIENT_ID_123',
          client_secret: 'FAKE_CLIENT_SECRET_123',
          code: '123-456',
        },
      );
      expect(res.token).toBe('this-is-a-token');
      expect(res.hostname).toBe('github.com' as Hostname);
    });
  });

  describe('addAccount', () => {
    let mockAuthState: AuthState;
    const fetchAuthenticatedUserDetailsSpy = vi.spyOn(
      apiClient,
      'fetchAuthenticatedUserDetails',
    );

    beforeEach(() => {
      mockAuthState = {
        accounts: [],
      };

      // axios will default to using the XHR adapter which can't be intercepted
      // by nock. So, configure axios to use the node adapter.
      axios.defaults.adapter = 'http';
    });

    describe('should add GitHub Cloud account', () => {
      beforeEach(() => {
        fetchAuthenticatedUserDetailsSpy.mockResolvedValue({
          data: {
            viewer: {
              ...mockGitifyUser,
              avatarUrl: mockGitifyUser.avatar,
            } as UserDetailsResponse,
          },
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
            user: mockGitifyUser,
            version: 'latest',
          },
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
            user: mockGitifyUser,
            version: 'latest',
          },
        ]);
      });
    });

    describe('should add GitHub Enterprise Server account', () => {
      beforeEach(() => {
        fetchAuthenticatedUserDetailsSpy.mockResolvedValue({
          data: {
            viewer: {
              ...mockGitifyUser,
              avatarUrl: mockGitifyUser.avatar,
            } as UserDetailsResponse,
          },
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
            user: mockGitifyUser,
            version: '3.0.0',
          },
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
            user: mockGitifyUser,
            version: '3.0.0',
          },
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
