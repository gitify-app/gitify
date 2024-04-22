import type { AxiosPromise, AxiosResponse } from 'axios';

import remote from '@electron/remote';
const browserWindow = new remote.BrowserWindow();

import type { AuthState } from '../types';
import * as apiRequests from './api/request';
import * as auth from './auth';

describe('utils/auth.tsx', () => {
  describe('authGitHub', () => {
    const loadURLMock = jest.spyOn(browserWindow, 'loadURL');

    beforeEach(() => {
      loadURLMock.mockReset();
    });

    it('should call authGithub - success', async () => {
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

    it('should call authGithub - failure', async () => {
      (
        jest.spyOn(browserWindow.webContents, 'on') as jest.Mock
      ).mockImplementation((event, callback): void => {
        if (event === 'will-redirect') {
          const event = new Event('will-redirect');
          callback(event, 'http://www.github.com/?error=Oops');
        }
      });

      await expect(async () => await auth.authGitHub()).rejects.toEqual(
        "Oops! Something went wrong and we couldn't log you in using Github. Please try again.",
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
    const accounts: AuthState = {
      token: null,
      enterpriseAccounts: [],
      user: null,
    };

    it('should add a github.com account', async () => {
      const result = await auth.addAccount(accounts, '123-456', 'github.com');

      expect(result).toEqual({ ...accounts, token: '123-456' });
    });

    it('should add an enterprise account', async () => {
      const result = await auth.addAccount(
        accounts,
        '123-456',
        'github.gitify.io',
      );

      expect(result).toEqual({
        ...accounts,
        enterpriseAccounts: [
          { hostname: 'github.gitify.io', token: '123-456' },
        ],
      });
    });
  });
});
