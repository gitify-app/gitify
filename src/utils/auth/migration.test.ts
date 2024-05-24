import { mockGitifyUser, mockToken } from '../../__mocks__/mock-state';
import type { AuthAccounts } from '../../types';
import Constants from '../constants';
import { convertAccounts, hasAccountsToMigrate } from './migration';

describe('utils/auth/migration.ts', () => {
  describe('hasAccountsToMigrate', () => {
    it('should not migrate if none exist', () => {
      expect(hasAccountsToMigrate(null)).toBe(false);
    });

    it('should migrate if token exist', () => {
      expect(
        hasAccountsToMigrate({
          token: mockToken,
        } as AuthAccounts),
      ).toBe(true);
    });

    it('should migrate if token exist', () => {
      expect(
        hasAccountsToMigrate({
          enterpriseAccounts: [
            { hostname: 'github.gitify.io', token: mockToken },
          ],
        } as AuthAccounts),
      ).toBe(true);
    });
  });

  describe('convertAccounts', () => {
    it('should convert accounts - personal access token only', () => {
      const result = convertAccounts({
        token: mockToken,
        user: mockGitifyUser,
      } as AuthAccounts);

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

    it('should convert accounts - oauth app only', () => {
      const result = convertAccounts({
        enterpriseAccounts: [
          { hostname: 'github.gitify.io', token: mockToken },
        ],
      } as AuthAccounts);

      expect(result).toEqual([
        {
          hostname: 'github.gitify.io',
          platform: 'GitHub Enterprise Server',
          method: 'OAuth App',
          token: mockToken,
          user: null,
        },
      ]);
    });

    it('should convert accounts - combination', () => {
      const result = convertAccounts({
        token: mockToken,
        user: mockGitifyUser,
        enterpriseAccounts: [
          { hostname: 'github.gitify.io', token: mockToken },
        ],
      } as AuthAccounts);

      expect(result).toEqual([
        {
          hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
          platform: 'GitHub Cloud',
          method: 'Personal Access Token',
          token: mockToken,
          user: mockGitifyUser,
        },
        {
          hostname: 'github.gitify.io',
          platform: 'GitHub Enterprise Server',
          method: 'OAuth App',
          token: mockToken,
          user: null,
        },
      ]);
    });
  });
});
