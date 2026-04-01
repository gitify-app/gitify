import type { Account } from '../../types';

import {
  formatAlternateOAuthScopes,
  formatRecommendedOAuthScopes,
  formatRequiredOAuthScopes,
  getAlternateScopeNames,
  getRecommendedScopeNames,
  getRequiredScopeNames,
  hasAlternateScopes,
  hasRecommendedScopes,
  hasRequiredScopes,
} from './scopes';

describe('renderer/utils/auth/scopes.ts', () => {
  describe('getRequiredScopeNames', () => {
    it('returns the required scope names', () => {
      expect(getRequiredScopeNames()).toEqual(['notifications', 'read:user']);
    });
  });

  describe('getRecommendedScopeNames', () => {
    it('returns the recommended scope names', () => {
      expect(getRecommendedScopeNames()).toEqual([
        'notifications',
        'read:user',
        'repo',
      ]);
    });
  });

  describe('getAlternateScopeNames', () => {
    it('returns the alternate scope names', () => {
      expect(getAlternateScopeNames()).toEqual([
        'notifications',
        'read:user',
        'public_repo',
      ]);
    });
  });

  describe('formatRequiredOAuthScopes', () => {
    it('returns required scopes as a comma-separated string', () => {
      expect(formatRequiredOAuthScopes()).toBe('notifications, read:user');
    });
  });

  describe('formatRecommendedOAuthScopes', () => {
    it('returns recommended scopes as a comma-separated string', () => {
      expect(formatRecommendedOAuthScopes()).toBe(
        'notifications, read:user, repo',
      );
    });
  });

  describe('formatAlternateOAuthScopes', () => {
    it('returns alternate scopes as a comma-separated string', () => {
      expect(formatAlternateOAuthScopes()).toBe(
        'notifications, read:user, public_repo',
      );
    });
  });

  describe('hasRequiredScopes', () => {
    it('returns true when the account has all required scopes', () => {
      const account = {
        scopes: ['notifications', 'read:user', 'repo'],
      } as Account;
      expect(hasRequiredScopes(account)).toBe(true);
    });

    it('returns true for exactly the required scopes', () => {
      const account = { scopes: ['notifications', 'read:user'] } as Account;
      expect(hasRequiredScopes(account)).toBe(true);
    });

    it('returns false when a required scope is missing', () => {
      const account = { scopes: ['notifications'] } as Account;
      expect(hasRequiredScopes(account)).toBe(false);
    });

    it('returns false when scopes is undefined', () => {
      const account = { scopes: undefined } as Account;
      expect(hasRequiredScopes(account)).toBe(false);
    });
  });

  describe('hasRecommendedScopes', () => {
    it('returns true when the account has all recommended scopes', () => {
      const account = {
        scopes: ['notifications', 'read:user', 'repo'],
      } as Account;
      expect(hasRecommendedScopes(account)).toBe(true);
    });

    it('returns false when a recommended scope is missing', () => {
      const account = { scopes: ['notifications', 'read:user'] } as Account;
      expect(hasRecommendedScopes(account)).toBe(false);
    });
  });

  describe('hasAlternateScopes', () => {
    it('returns true when the account has all alternate scopes', () => {
      const account = {
        scopes: ['notifications', 'read:user', 'public_repo'],
      } as Account;
      expect(hasAlternateScopes(account)).toBe(true);
    });

    it('returns false when an alternate scope is missing', () => {
      const account = { scopes: ['notifications', 'read:user'] } as Account;
      expect(hasAlternateScopes(account)).toBe(false);
    });
  });
});
