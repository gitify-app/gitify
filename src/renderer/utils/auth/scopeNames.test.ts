import {
  formatAlternateOAuthScopes,
  formatRecommendedOAuthScopes,
  formatRequiredOAuthScopes,
  getAlternateScopeNames,
  getRecommendedScopeNames,
  getRequiredScopeNames,
} from './scopeNames';

describe('renderer/utils/auth/scopeNames.ts', () => {
  describe('getRequiredScopeNames', () => {
    it('returns the required scope names', () => {
      expect(getRequiredScopeNames()).toEqual(['notifications', 'read:user']);
    });
  });

  describe('getRecommendedScopeNames', () => {
    it('returns the recommended scope names', () => {
      expect(getRecommendedScopeNames()).toEqual(['notifications', 'read:user', 'repo']);
    });
  });

  describe('getAlternateScopeNames', () => {
    it('returns the alternate scope names', () => {
      expect(getAlternateScopeNames()).toEqual(['notifications', 'read:user', 'public_repo']);
    });
  });

  describe('formatRequiredOAuthScopes', () => {
    it('returns required scopes as a comma-separated string', () => {
      expect(formatRequiredOAuthScopes()).toBe('notifications, read:user');
    });
  });

  describe('formatRecommendedOAuthScopes', () => {
    it('returns recommended scopes as a comma-separated string', () => {
      expect(formatRecommendedOAuthScopes()).toBe('notifications, read:user, repo');
    });
  });

  describe('formatAlternateOAuthScopes', () => {
    it('returns alternate scopes as a comma-separated string', () => {
      expect(formatAlternateOAuthScopes()).toBe('notifications, read:user, public_repo');
    });
  });
});
