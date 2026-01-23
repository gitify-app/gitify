import type { Hostname } from '../../types';

import { getGitHubAPIBaseUrl } from './utils';

describe('renderer/utils/api/utils.ts', () => {
  describe('getGitHubAPIBaseUrl', () => {
    it('should generate a GitHub REST API url - non enterprise', () => {
      const result = getGitHubAPIBaseUrl('github.com' as Hostname, 'rest');

      expect(result.toString()).toBe('https://api.github.com/');
    });

    it('should generate a GitHub REST API url - enterprise', () => {
      const result = getGitHubAPIBaseUrl(
        'github.gitify.io' as Hostname,
        'rest',
      );

      expect(result.toString()).toBe('https://github.gitify.io/api/v3/');
    });
  });

  it('should generate a GitHub GraphQL url - non enterprise', () => {
    const result = getGitHubAPIBaseUrl('github.com' as Hostname, 'graphql');

    expect(result.toString()).toBe('https://api.github.com/');
  });

  it('should generate a GitHub GraphQL url - enterprise', () => {
    const result = getGitHubAPIBaseUrl(
      'github.gitify.io' as Hostname,
      'graphql',
    );

    expect(result.toString()).toBe('https://github.gitify.io/api/');
  });
});
