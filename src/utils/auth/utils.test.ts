import remote from '@electron/remote';
import type { AxiosPromise, AxiosResponse } from 'axios';
import { mockAuth, mockGitHubCloudAccount } from '../../__mocks__/state-mocks';
import type {
  Account,
  AuthCode,
  AuthState,
  ClientID,
  Hostname,
  Token,
} from '../../types';
import * as apiRequests from '../api/request';
import type { AuthMethod } from './types';
import * as auth from './utils';
import { getNewOAuthAppURL, getNewTokenURL } from './utils';

const browserWindow = new remote.BrowserWindow();

describe('utils/auth/utils.ts', () => {
  describe('authGitHub', () => {
    const loadURLMock = jest.spyOn(browserWindow, 'loadURL');

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call authGitHub - success', async () => {
      // Casting to jest.Mock avoids Typescript errors, where the spy is expected to match all the original
      // function's typing. I might fix all that if the return type of this was actually used, or if I was
      // writing this test for a new feature. Since I'm just upgrading Jest, jest.Mock is a nice escape hatch
      (
        jest.spyOn(browserWindow.webContents, 'on') as jest.Mock
      ).mockImplementation((event, callback): void => {
        if (event === 'will-redirect') {
          const event = new Event('will-redirect');
          callback(event, 'https://github.com/?code=123-456');
        }
      });

      const res = await auth.authGitHub();

      expect(res.authCode).toBe('123-456');

      expect(
        browserWindow.webContents.session.clearStorageData,
      ).toHaveBeenCalledTimes(1);

      expect(loadURLMock).toHaveBeenCalledTimes(1);
      expect(loadURLMock).toHaveBeenCalledWith(
        'https://github.com/login/oauth/authorize?client_id=FAKE_CLIENT_ID_123&scope=read%3Auser%2Cnotifications%2Crepo',
      );

      expect(browserWindow.destroy).toHaveBeenCalledTimes(1);
    });

    it('should call authGitHub - failure', async () => {
      (
        jest.spyOn(browserWindow.webContents, 'on') as jest.Mock
      ).mockImplementation((event, callback): void => {
        if (event === 'will-redirect') {
          const event = new Event('will-redirect');
          callback(event, 'https://www.github.com/?error=Oops');
        }
      });

      await expect(async () => await auth.authGitHub()).rejects.toEqual(
        "Oops! Something went wrong and we couldn't log you in using GitHub. Please try again.",
      );
      expect(loadURLMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getToken', () => {
    const authCode = '123-456' as AuthCode;
    const apiRequestMock = jest.spyOn(apiRequests, 'apiRequest');

    it('should get a token - success', async () => {
      const requestPromise = new Promise((resolve) =>
        resolve({ data: { access_token: 'this-is-a-token' } } as AxiosResponse),
      ) as AxiosPromise;

      apiRequestMock.mockResolvedValueOnce(requestPromise);

      const res = await auth.getToken(authCode);

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

    it('should get a token - failure', async () => {
      const message = 'Something went wrong.';

      const requestPromise = new Promise((_, reject) =>
        reject({ data: { message } } as AxiosResponse),
      ) as AxiosPromise;

      apiRequestMock.mockResolvedValueOnce(requestPromise);

      const call = async () => await auth.getToken(authCode);

      await expect(call).rejects.toEqual({ data: { message } });
    });
  });

  describe('addAccount', () => {
    let mockAuthState: AuthState;

    beforeEach(() => {
      mockAuthState = {
        accounts: [],
      };
    });

    describe('should add GitHub Cloud account', () => {
      it('should add personal access token account', () => {
        const result = auth.addAccount(
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
            token: '123-456' as Token,
            user: undefined,
          },
        ]);
      });

      it('should add oauth app account', () => {
        const result = auth.addAccount(
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
            token: '123-456' as Token,
            user: undefined,
          },
        ]);
      });
    });

    describe('should add GitHub Enterprise Server account', () => {
      it('should add personal access token account', () => {
        const result = auth.addAccount(
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
            token: '123-456' as Token,
            user: undefined,
          },
        ]);
      });

      it('should add oauth app account', () => {
        const result = auth.addAccount(
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
            token: '123-456' as Token,
            user: undefined,
          },
        ]);
      });
    });
  });

  describe('removeAccount', () => {
    it('should remove account with matching token', async () => {
      expect(mockAuth.accounts.length).toBe(2);

      const result = auth.removeAccount(mockAuth, mockGitHubCloudAccount);

      expect(result.accounts.length).toBe(1);
    });

    it('should do nothing if no accounts match', async () => {
      const mockAccount = {
        token: 'unknown-token',
      } as Account;

      expect(mockAuth.accounts.length).toBe(2);

      const result = auth.removeAccount(mockAuth, mockAccount);

      expect(result.accounts.length).toBe(2);
    });
  });

  it('getDeveloperSettingsURL', () => {
    expect(
      auth.getDeveloperSettingsURL({
        hostname: 'github.com' as Hostname,
        method: 'GitHub App',
      } as Account),
    ).toBe('https://github.com/settings/apps');

    expect(
      auth.getDeveloperSettingsURL({
        hostname: 'github.com' as Hostname,
        method: 'OAuth App',
      } as Account),
    ).toBe('https://github.com/settings/developers');

    expect(
      auth.getDeveloperSettingsURL({
        hostname: 'github.com' as Hostname,
        method: 'Personal Access Token',
      } as Account),
    ).toBe('https://github.com/settings/tokens');

    expect(
      auth.getDeveloperSettingsURL({
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
      expect(auth.isValidHostname('github.com' as Hostname)).toBeTruthy();
    });

    it('should validate hostname - github enterprise server', () => {
      expect(auth.isValidHostname('github.gitify.io' as Hostname)).toBeTruthy();
    });

    it('should invalidate hostname - empty', () => {
      expect(auth.isValidHostname('' as Hostname)).toBeFalsy();
    });

    it('should invalidate hostname - invalid', () => {
      expect(auth.isValidHostname('github' as Hostname)).toBeFalsy();
    });
  });

  describe('isValidClientId', () => {
    it('should validate client id - valid', () => {
      expect(
        auth.isValidClientId('1234567890_ASDFGHJKL' as ClientID),
      ).toBeTruthy();
    });

    it('should validate client id - empty', () => {
      expect(auth.isValidClientId('' as ClientID)).toBeFalsy();
    });

    it('should validate client id - invalid', () => {
      expect(auth.isValidClientId('1234567890asdfg' as ClientID)).toBeFalsy();
    });
  });

  describe('isValidToken', () => {
    it('should validate token - valid', () => {
      expect(
        auth.isValidToken('1234567890_asdfghjklPOIUYTREWQ0987654321' as Token),
      ).toBeTruthy();
    });

    it('should validate token - empty', () => {
      expect(auth.isValidToken('' as Token)).toBeFalsy();
    });

    it('should validate token - invalid', () => {
      expect(auth.isValidToken('1234567890asdfg' as Token)).toBeFalsy();
    });
  });
});
