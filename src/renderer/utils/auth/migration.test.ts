import axios from 'axios';
import nock from 'nock';

import * as logger from '../../../shared/logger';
import { mockGitifyUser, mockToken } from '../../__mocks__/state-mocks';
import type { AuthState, Hostname } from '../../types';
import { Constants } from '../constants';
import {
  convertAccounts,
  hasAccountsToMigrate,
  migrateAuthenticatedAccounts,
} from './migration';

jest.spyOn(console, 'log').mockImplementation(() => null);

describe('renderer/utils/auth/migration.ts', () => {
  beforeEach(() => {
    // axios will default to using the XHR adapter which can't be intercepted
    // by nock. So, configure axios to use the node adapter.
    axios.defaults.adapter = 'http';
  });

  describe('migrateAuthenticatedAccounts', () => {
    it('migrate and save legacy accounts', async () => {
      const logInfoSpy = jest.spyOn(logger, 'logInfo').mockImplementation();
      jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValueOnce(
        JSON.stringify({
          auth: {
            token: mockToken,
          },
          settings: { theme: 'DARK' },
        }),
      );

      nock('https://api.github.com').get('/user').reply(200, mockGitifyUser);

      jest.spyOn(localStorage.__proto__, 'setItem');

      await migrateAuthenticatedAccounts();

      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      expect(logInfoSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('hasAccountsToMigrate', () => {
    it('should not migrate if none exist', () => {
      expect(hasAccountsToMigrate(null)).toBe(false);
    });

    it('should not migrate if empty', () => {
      expect(hasAccountsToMigrate({} as AuthState)).toBe(false);
    });

    it('should migrate if token exist', () => {
      expect(
        hasAccountsToMigrate({
          token: mockToken,
        } as AuthState),
      ).toBe(true);
    });

    it('should migrate if token exist', () => {
      expect(
        hasAccountsToMigrate({
          enterpriseAccounts: [
            { hostname: 'github.gitify.io' as Hostname, token: mockToken },
          ],
        } as AuthState),
      ).toBe(true);
    });

    it('should not if there are already accounts', () => {
      expect(
        hasAccountsToMigrate({
          token: mockToken,
          enterpriseAccounts: [
            { hostname: 'github.gitify.io' as Hostname, token: mockToken },
          ],
          accounts: [{ hostname: 'github.com' as Hostname, token: mockToken }],
        } as AuthState),
      ).toBe(false);
    });
  });

  describe('convertAccounts', () => {
    it('should convert accounts - personal access token only', async () => {
      nock('https://api.github.com')
        .get('/user')
        .reply(200, { ...mockGitifyUser, avatar_url: mockGitifyUser.avatar });

      const result = await convertAccounts({
        token: mockToken,
        user: mockGitifyUser,
      } as AuthState);

      expect(result).toEqual([
        {
          hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
          platform: 'GitHub Cloud',
          method: 'Personal Access Token',
          token: mockToken,
          user: mockGitifyUser,
        },
      ]);
    });

    it('should convert accounts - oauth app only', async () => {
      nock('https://github.gitify.io/api/v3')
        .get('/user')
        .reply(200, { ...mockGitifyUser, avatar_url: mockGitifyUser.avatar });

      const result = await convertAccounts({
        enterpriseAccounts: [
          { hostname: 'github.gitify.io' as Hostname, token: mockToken },
        ],
      } as AuthState);

      expect(result).toEqual([
        {
          hostname: 'github.gitify.io' as Hostname,
          platform: 'GitHub Enterprise Server',
          method: 'OAuth App',
          token: mockToken,
          user: mockGitifyUser,
        },
      ]);
    });

    it('should convert accounts - combination', async () => {
      nock('https://api.github.com')
        .get('/user')
        .reply(200, { ...mockGitifyUser, avatar_url: mockGitifyUser.avatar });
      nock('https://github.gitify.io/api/v3')
        .get('/user')
        .reply(200, { ...mockGitifyUser, avatar_url: mockGitifyUser.avatar });

      const result = await convertAccounts({
        token: mockToken,
        user: mockGitifyUser,
        enterpriseAccounts: [
          { hostname: 'github.gitify.io' as Hostname, token: mockToken },
        ],
      } as AuthState);

      expect(result).toEqual([
        {
          hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
          platform: 'GitHub Cloud',
          method: 'Personal Access Token',
          token: mockToken,
          user: mockGitifyUser,
        },
        {
          hostname: 'github.gitify.io' as Hostname,
          platform: 'GitHub Enterprise Server',
          method: 'OAuth App',
          token: mockToken,
          user: mockGitifyUser,
        },
      ]);
    });
  });
});
