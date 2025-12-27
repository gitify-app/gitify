import type { AxiosResponse } from 'axios';

import type { Hostname } from '../../types';
import {
  getGitHubAPIBaseUrl,
  getGitHubGraphQLUrl,
  getNextURLFromLinkHeader,
} from './utils';

describe('renderer/utils/api/utils.ts', () => {
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

  describe('getNextURLFromLinkHeader', () => {
    it('should parse next url from link header', () => {
      const mockResponse = {
        headers: {
          link: '<https://api.github.com/notifications?participating=false&page=2>; rel="next", <https://api.github.com/notifications?participating=false&page=2>; rel="last"',
        },
      };

      const result = getNextURLFromLinkHeader(
        mockResponse as unknown as AxiosResponse,
      );
      expect(result?.toString()).toBe(
        'https://api.github.com/notifications?participating=false&page=2',
      );
    });

    it('should return null if no next url in link header', () => {
      const mockResponse = {
        headers: {
          link: '<https://api.github.com/notifications?participating=false&page=2>; rel="last"',
        },
      };

      const result = getNextURLFromLinkHeader(
        mockResponse as unknown as AxiosResponse,
      );
      expect(result).toBeNull();
    });

    it('should return null if no link header exists', () => {
      const mockResponse = {
        headers: {},
      };

      const result = getNextURLFromLinkHeader(
        mockResponse as unknown as AxiosResponse,
      );
      expect(result).toBeNull();
    });
  });
});
