import type { Account } from '../../types';

import { hasAlternateScopes, hasRecommendedScopes, hasRequiredScopes } from './scopes';

function githubAccount(scopes: string[] | undefined): Account {
  return { forge: 'github', scopes } as Account;
}

describe('renderer/utils/auth/scopes.ts', () => {
  describe('hasRequiredScopes', () => {
    it('returns true when the account has all required scopes', () => {
      expect(hasRequiredScopes(githubAccount(['notifications', 'read:user', 'repo']))).toBe(true);
    });

    it('returns true for exactly the required scopes', () => {
      expect(hasRequiredScopes(githubAccount(['notifications', 'read:user']))).toBe(true);
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
      expect(hasRecommendedScopes(githubAccount(['notifications', 'read:user', 'repo']))).toBe(
        true,
      );
    });

    it('returns false when a recommended scope is missing', () => {
      expect(hasRecommendedScopes(githubAccount(['notifications', 'read:user']))).toBe(false);
    });
  });

  describe('hasAlternateScopes', () => {
    it('returns true when the account has all alternate scopes', () => {
      expect(hasAlternateScopes(githubAccount(['notifications', 'read:user', 'public_repo']))).toBe(
        true,
      );
    });

    it('returns false when an alternate scope is missing', () => {
      expect(hasAlternateScopes(githubAccount(['notifications', 'read:user']))).toBe(false);
    });
  });
});
