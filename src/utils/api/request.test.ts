import { vi } from 'vitest';

// Mock decryptValue to return 'decrypted' for consistent test expectations
vi.mock('../comms', () => ({
  decryptValue: vi.fn().mockResolvedValue('decrypted'),
}));

import {
  createMockResponse,
  fetch,
} from '../../__mocks__/@tauri-apps/plugin-http';
import { mockToken } from '../../__mocks__/state-mocks';
import type { Link } from '../../types';
import {
  mockAuthHeaders,
  mockNoAuthHeaders,
  mockNonCachedAuthHeaders,
} from './__mocks__/request-mocks';
import { FetchAuthenticatedUserDetailsDocument } from './graphql/generated/graphql';
import {
  apiRequest,
  apiRequestAuth,
  getHeaders,
  performGraphQLRequest,
  performGraphQLRequestString,
  shouldRequestWithNoCache,
} from './request';

const url = 'https://example.com' as Link;
const method = 'GET';

describe('renderer/utils/api/request.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue(createMockResponse({}));
  });

  describe('apiRequest', () => {
    it('should make a POST request with body', async () => {
      const data = { key: 'value' };

      await apiRequest(url, 'POST', data);

      expect(fetch).toHaveBeenCalledWith(url, {
        method: 'POST',
        headers: mockNoAuthHeaders,
        body: JSON.stringify(data),
      });
    });

    it('should make a GET request without body (GET cannot have body)', async () => {
      await apiRequest(url, method);

      expect(fetch).toHaveBeenCalledWith(url, {
        method,
        headers: mockNoAuthHeaders,
        body: undefined,
      });
    });
  });

  describe('apiRequestAuth', () => {
    it('should make an authenticated POST request with body', async () => {
      const data = { key: 'value' };

      await apiRequestAuth(url, 'POST', mockToken, data);

      expect(fetch).toHaveBeenCalledWith(url, {
        method: 'POST',
        headers: mockAuthHeaders,
        body: JSON.stringify(data),
      });
    });

    it('should make an authenticated GET request without body', async () => {
      await apiRequestAuth(url, method, mockToken);

      expect(fetch).toHaveBeenCalledWith(url, {
        method,
        headers: mockAuthHeaders,
        body: undefined,
      });
    });
  });

  describe('performGraphQLRequest', () => {
    it('should performGraphQLRequest with the correct parameters and default data', async () => {
      fetch.mockResolvedValueOnce(createMockResponse({ data: {}, errors: [] }));

      const expectedData = {
        query: FetchAuthenticatedUserDetailsDocument,
        variables: undefined,
      };

      await performGraphQLRequest(
        url,
        mockToken,
        FetchAuthenticatedUserDetailsDocument,
      );

      expect(fetch).toHaveBeenCalledWith(url, {
        method: 'POST',
        headers: mockAuthHeaders,
        body: JSON.stringify(expectedData),
      });
    });
  });

  describe('performGraphQLRequestString', () => {
    it('should performGraphQLRequestString with the correct parameters and default data', async () => {
      fetch.mockResolvedValueOnce(createMockResponse({ data: {}, errors: [] }));

      const queryString = 'query Foo { repository { issue { title } } }';
      const expectedData = {
        query: queryString,
        variables: undefined,
      };

      await performGraphQLRequestString(url, mockToken, queryString);

      expect(fetch).toHaveBeenCalledWith(url, {
        method: 'POST',
        headers: mockAuthHeaders,
        body: JSON.stringify(expectedData),
      });
    });
  });

  describe('shouldRequestWithNoCache', () => {
    it('shouldRequestWithNoCache', () => {
      expect(
        shouldRequestWithNoCache('https://example.com/api/v3/notifications'),
      ).toBe(true);

      expect(
        shouldRequestWithNoCache(
          'https://example.com/login/oauth/access_token',
        ),
      ).toBe(true);

      expect(
        shouldRequestWithNoCache('https://example.com/notifications'),
      ).toBe(true);

      expect(
        shouldRequestWithNoCache('https://example.com/some/other/endpoint'),
      ).toBe(false);
    });
  });

  describe('getHeaders', () => {
    it('should get headers correctly', async () => {
      expect(await getHeaders(url)).toEqual(mockNoAuthHeaders);

      expect(await getHeaders(url, mockToken)).toEqual(mockAuthHeaders);

      expect(
        await getHeaders(
          'https://example.com/api/v3/notifications' as Link,
          mockToken,
        ),
      ).toEqual(mockNonCachedAuthHeaders);
    });
  });
});
