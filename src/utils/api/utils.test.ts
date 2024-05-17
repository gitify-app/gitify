import { getGitHubAPIBaseUrl, getGitHubGraphQLUrl } from './utils';

describe('utils/api/utils.ts', () => {
  describe('getGitHubAPIBaseUrl', () => {
    it('should generate a GitHub API url - non enterprise', () => {
      const result = getGitHubAPIBaseUrl('github.com');
      expect(result.toString()).toBe('https://api.github.com/');
    });

    it('should generate a GitHub API url - enterprise', () => {
      const result = getGitHubAPIBaseUrl('github.manos.im');
      expect(result.toString()).toBe('https://github.manos.im/api/v3/');
    });
  });

  describe('generateGitHubGraphQLAPIUrl', () => {
    it('should generate a GitHub GraphQL url - non enterprise', () => {
      const result = getGitHubGraphQLUrl('github.com');
      expect(result.toString()).toBe('https://api.github.com/graphql');
    });

    it('should generate a GitHub GraphQL url - enterprise', () => {
      const result = getGitHubGraphQLUrl('github.manos.im');
      expect(result.toString()).toBe('https://github.manos.im/api/graphql');
    });
  });
});
