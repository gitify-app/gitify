import { mockGitifyUser, mockToken } from '../../__mocks__/state-mocks';
import type { AuthState } from '../../types';
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
        } as AuthState),
      ).toBe(true);
    });

    it('should migrate if token exist', () => {
      expect(
        hasAccountsToMigrate({
          enterpriseAccounts: [
            { hostname: 'github.gitify.io', token: mockToken },
          ],
        } as AuthState),
      ).toBe(true);
    });

    it('should not if there are already accounts', () => {
      expect(
        hasAccountsToMigrate({
          token: mockToken,
          enterpriseAccounts: [
            { hostname: 'github.gitify.io', token: mockToken },
          ],
          accounts: [{ hostname: 'github.com', token: mockToken }],
        } as AuthState),
      ).toBe(false);
    });
  });

  describe('convertAccounts', () => {
    it('should convert accounts - personal access token only', () => {
      const result = convertAccounts({
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

    it('should convert accounts - oauth app only', () => {
      const result = convertAccounts({
        enterpriseAccounts: [
          { hostname: 'github.gitify.io', token: mockToken },
        ],
      } as AuthState);

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