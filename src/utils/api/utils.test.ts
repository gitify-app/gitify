import { getGitHubAPIBaseUrl } from './utils';

describe('utils/api/utils.ts', () => {
  describe('generateGitHubAPIUrl', () => {
    it('should generate a GitHub API url - non enterprise', () => {
      const result = getGitHubAPIBaseUrl('github.com');
      expect(result.toString()).toBe('https://api.github.com/');
    });

    it('should generate a GitHub API url - enterprise', () => {
      const result = getGitHubAPIBaseUrl('github.manos.im');
      expect(result.toString()).toBe('https://github.manos.im/api/v3/');
    });
  });
});
