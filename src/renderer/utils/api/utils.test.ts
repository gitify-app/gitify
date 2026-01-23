import type { Hostname } from '../../types';

import {
  getGitHubAPIBaseUrl,
  getGitHubAuthBaseUrl,
  getGitHubGraphQLUrl,
} from './utils';

describe('renderer/utils/api/utils.ts', () => {
  describe('getGitHubAuthBaseUrl', () => {
    it('should generate a GitHub Auth url - non enterprise', () => {
      const result = getGitHubAuthBaseUrl('github.com' as Hostname);
      expect(result.toString()).toBe('https://github.com/');
    });

    it('should generate a GitHub Auth url - enterprise', () => {
      const result = getGitHubAuthBaseUrl('github.gitify.io' as Hostname);
      expect(result.toString()).toBe('https://github.gitify.io/api/v3/');
    });
  });

  describe('getGitHubAPIBaseUrl', () => {
    it('should generate a GitHub API url - non enterprise', () => {
      const result = getGitHubAPIBaseUrl('github.com' as Hostname);
      expect(result.toString()).toBe('https://api.github.com/');
    });

    it('should generate a GitHub API url - enterprise', () => {
      const result = getGitHubAPIBaseUrl('github.gitify.io' as Hostname);
      expect(result.toString()).toBe('https://github.gitify.io/api/v3/');
    });
  });

  describe('getGitHubGraphQLUrl', () => {
    it('should generate a GitHub GraphQL url - non enterprise', () => {
      const result = getGitHubGraphQLUrl('github.com' as Hostname);
      expect(result.toString()).toBe('https://api.github.com/graphql');
    });

    it('should generate a GitHub GraphQL url - enterprise', () => {
      const result = getGitHubGraphQLUrl('github.gitify.io' as Hostname);
      expect(result.toString()).toBe('https://github.gitify.io/api/graphql');
    });
  });

  
});
