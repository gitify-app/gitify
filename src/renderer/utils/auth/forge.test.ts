import { getResolvedForge, isForgeGitea } from './forge';

describe('renderer/utils/auth/forge.ts', () => {
  describe('getResolvedForge', () => {
    it('defaults undefined to github', () => {
      expect(getResolvedForge(undefined)).toBe('github');
    });

    it('returns gitea when set', () => {
      expect(getResolvedForge('gitea')).toBe('gitea');
    });
  });

  describe('isForgeGitea', () => {
    it('returns false for github and undefined', () => {
      expect(isForgeGitea(undefined)).toBe(false);
      expect(isForgeGitea('github')).toBe(false);
    });

    it('returns true for gitea', () => {
      expect(isForgeGitea('gitea')).toBe(true);
    });
  });
});
