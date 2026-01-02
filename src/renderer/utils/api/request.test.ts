import axios from 'axios';

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

jest.mock('axios');

const url = 'https://example.com' as Link;
const method = 'get';

describe('renderer/utils/api/request.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apiRequest', () => {
    it('should make a request with the correct parameters', async () => {
      const data = { key: 'value' };

      await apiRequest(url, method, data);

      expect(axios).toHaveBeenCalledWith({
        method,
        url,
        data,
        headers: mockNoAuthHeaders,
      });
    });

    it('should make a request with the correct parameters and default data', async () => {
      const data = {};
      await apiRequest(url, method);

      expect(axios).toHaveBeenCalledWith({
        method,
        url,
        data,
        headers: mockNoAuthHeaders,
      });
    });
  });

  describe('apiRequestAuth', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should make an authenticated request with the correct parameters', async () => {
      const data = { key: 'value' };

      await apiRequestAuth(url, method, mockToken, data);

      expect(axios).toHaveBeenCalledWith({
        method,
        url,
        data,
        headers: mockAuthHeaders,
      });
    });

    it('should make an authenticated request with the correct parameters and default data', async () => {
      const data = {};

      await apiRequestAuth(url, method, mockToken);

      expect(axios).toHaveBeenCalledWith({
        method,
        url,
        data,
        headers: mockAuthHeaders,
      });
    });
  });

  describe('performGraphQLRequest', () => {
    it('should performGraphQLRequest with the correct parameters and default data', async () => {
      (axios as unknown as jest.Mock).mockResolvedValue({
        data: { data: {}, errors: [] },
        headers: {},
      });
      const expectedData = {
        query: FetchAuthenticatedUserDetailsDocument,
        variables: undefined,
      };

      await performGraphQLRequest(
        url,
        mockToken,
        FetchAuthenticatedUserDetailsDocument,
      );

      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url,
        data: expectedData,
        headers: mockAuthHeaders,
      });
    });
  });

  describe('performGraphQLRequestString', () => {
    it('should performGraphQLRequestString with the correct parameters and default data', async () => {
      (axios as unknown as jest.Mock).mockResolvedValue({
        data: { data: {}, errors: [] },
        headers: {},
      });
      const queryString = 'query Foo { repository { issue { title } } }';
      const expectedData = {
        query: queryString,
        variables: undefined,
      };

      await performGraphQLRequestString(url, mockToken, queryString);

      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url,
        data: expectedData,
        headers: mockAuthHeaders,
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
