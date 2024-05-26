import remote from '@electron/remote';
import type { AxiosPromise, AxiosResponse } from 'axios';
import type { AuthState } from '../types';
import * as apiRequests from './api/request';
import * as auth from './auth';
import { getNewOAuthAppURL, getNewTokenURL } from './auth';

const browserWindow = new remote.BrowserWindow();

describe('utils/auth/utils.ts', () => {
  describe('authGitHub', () => {
    const loadURLMock = jest.spyOn(browserWindow, 'loadURL');

    beforeEach(() => {
      loadURLMock.mockReset();
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
          callback(event, 'http://github.com/?code=123-456');
        }
      });

      const res = await auth.authGitHub();

      expect(res.authCode).toBe('123-456');

      expect(
        browserWindow.webContents.session.clearStorageData,
      ).toHaveBeenCalledTimes(1);

      expect(loadURLMock).toHaveBeenCalledTimes(1);
      expect(loadURLMock).toHaveBeenCalledWith(
        'https://github.com/login/oauth/authorize?client_id=FAKE_CLIENT_ID_123&scope=read:user,notifications,repo',
      );

      expect(browserWindow.destroy).toHaveBeenCalledTimes(1);
    });

    it('should call authGitHub - failure', async () => {
      (
        jest.spyOn(browserWindow.webContents, 'on') as jest.Mock
      ).mockImplementation((event, callback): void => {
        if (event === 'will-redirect') {
          const event = new Event('will-redirect');
          callback(event, 'http://www.github.com/?error=Oops');
        }
      });

      await expect(async () => await auth.authGitHub()).rejects.toEqual(
        "Oops! Something went wrong and we couldn't log you in using GitHub. Please try again.",
      );
      expect(loadURLMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getToken', () => {
    const authCode = '123-456';
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
      expect(res.hostname).toBe('github.com');
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
      it('should add personal access token account', async () => {
        const result = await auth.addAccount(
          mockAuthState,
          'Personal Access Token',
          '123-456',
          'github.com',
        );

        expect(result.accounts).toEqual([
          {
            hostname: 'github.com',
            method: 'Personal Access Token',
            platform: 'GitHub Cloud',
            token: '123-456',
            user: undefined,
          },
        ]);
      });

      it('should add oauth app account', async () => {
        const result = await auth.addAccount(
          mockAuthState,
          'OAuth App',
          '123-456',
          'github.com',
        );

        expect(result.accounts).toEqual([
          {
            hostname: 'github.com',
            method: 'OAuth App',
            platform: 'GitHub Cloud',
            token: '123-456',
            user: undefined,
          },
        ]);
      });
    });

    describe('should add GitHub Enterprise Server account', () => {
      it('should add personal access token account', async () => {
        const result = await auth.addAccount(
          mockAuthState,
          'Personal Access Token',
          '123-456',
          'github.gitify.io',
        );

        expect(result.accounts).toEqual([
          {
            hostname: 'github.gitify.io',
            method: 'Personal Access Token',
            platform: 'GitHub Enterprise Server',
            token: '123-456',
            user: undefined,
          },
        ]);
      });

      it('should add oauth app account', async () => {
        const result = await auth.addAccount(
          mockAuthState,
          'OAuth App',
          '123-456',
          'github.gitify.io',
        );

        expect(result.accounts).toEqual([
          {
            hostname: 'github.gitify.io',
            method: 'OAuth App',
            platform: 'GitHub Enterprise Server',
            token: '123-456',
            user: undefined,
          },
        ]);
      });
    });
  });

  describe('getNewTokenURL', () => {
    it('should generate new PAT url - github cloud', () => {
      expect(
        getNewTokenURL('github.com').startsWith(
          'https://github.com/settings/tokens/new',
        ),
      ).toBeTruthy();
    });

    it('should generate new PAT url - github server', () => {
      expect(
        getNewTokenURL('github.gitify.io').startsWith(
          'https://github.gitify.io/settings/tokens/new',
        ),
      ).toBeTruthy();
    });
  });

  describe('getNewOAuthAppURL', () => {
    it('should generate new oauth app url - github cloud', () => {
      expect(
        getNewOAuthAppURL('github.com').startsWith(
          'https://github.com/settings/applications/new',
        ),
      ).toBeTruthy();
    });

    it('should generate new oauth app url - github server', () => {
      expect(
        getNewOAuthAppURL('github.gitify.io').startsWith(
          'https://github.gitify.io/settings/applications/new',
        ),
      ).toBeTruthy();
    });
  });

  describe('isValidHostname', () => {
    it('should validate hostname - github cloud', () => {
      expect(auth.isValidHostname('github.com')).toBeTruthy();
    });

    it('should validate hostname - github enterprise server', () => {
      expect(auth.isValidHostname('github.gitify.io')).toBeTruthy();
    });

    it('should invalidate hostname - empty', () => {
      expect(auth.isValidHostname('')).toBeFalsy();
    });

    it('should invalidate hostname - invalid', () => {
      expect(auth.isValidHostname('github')).toBeFalsy();
    });
  });

  describe('isValidClientId', () => {
    it('should validate client id - valid', () => {
      expect(auth.isValidClientId('1234567890_ASDFGHJKL')).toBeTruthy();
    });

    it('should validate client id - empty', () => {
      expect(auth.isValidClientId('')).toBeFalsy();
    });

    it('should validate client id - invalid', () => {
      expect(auth.isValidClientId('1234567890asdfg')).toBeFalsy();
    });
  });

  describe('isValidToken', () => {
    it('should validate token - valid', () => {
      expect(
        auth.isValidToken('1234567890_asdfghjklPOIUYTREWQ0987654321'),
      ).toBeTruthy();
    });

    it('should validate token - empty', () => {
      expect(auth.isValidToken('')).toBeFalsy();
    });

    it('should validate token - invalid', () => {
      expect(auth.isValidToken('1234567890asdfg')).toBeFalsy();
    });
  });
});
