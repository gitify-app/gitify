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

function githubAccount(scopes: string[] | undefined): Account {
  return { forge: 'github', scopes } as Account;
}

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
      expect(
        hasRequiredScopes(
          githubAccount(['notifications', 'read:user', 'repo']),
        ),
      ).toBe(true);
    });

    it('returns true for exactly the required scopes', () => {
      expect(
        hasRequiredScopes(githubAccount(['notifications', 'read:user'])),
      ).toBe(true);
    });

    it('returns false when a required scope is missing', () => {
      expect(hasRequiredScopes(githubAccount(['notifications']))).toBe(false);
    });

    it('returns false when scopes is undefined', () => {
      expect(hasRequiredScopes(githubAccount(undefined))).toBe(false);
    });
  });

  describe('hasRecommendedScopes', () => {
    it('returns true when the account has all recommended scopes', () => {
      expect(
        hasRecommendedScopes(
          githubAccount(['notifications', 'read:user', 'repo']),
        ),
      ).toBe(true);
    });

    it('returns false when a recommended scope is missing', () => {
      expect(
        hasRecommendedScopes(githubAccount(['notifications', 'read:user'])),
      ).toBe(false);
    });
  });

  describe('hasAlternateScopes', () => {
    it('returns true when the account has all alternate scopes', () => {
      expect(
        hasAlternateScopes(
          githubAccount(['notifications', 'read:user', 'public_repo']),
        ),
      ).toBe(true);
    });

    it('returns false when an alternate scope is missing', () => {
      expect(
        hasAlternateScopes(githubAccount(['notifications', 'read:user'])),
      ).toBe(false);
    });
  });
});
