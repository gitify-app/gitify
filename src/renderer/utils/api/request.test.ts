import axios from 'axios';

import { mockToken } from '../../__mocks__/state-mocks';
import type { Link } from '../../types';
import * as rendererLogger from '../logger';
import {
  mockAuthHeaders,
  mockNoAuthHeaders,
  mockNonCachedAuthHeaders,
} from './__mocks__/request-mocks';
import { FetchAuthenticatedUserDetailsDocument } from './graphql/generated/graphql';
import {
  getHeaders,
  performAuthenticatedRESTRequest,
  performGraphQLRequest,
  performGraphQLRequestString,
  performUnauthenticatedRESTRequest,
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

      await performUnauthenticatedRESTRequest(url, method, data);

      expect(axios).toHaveBeenCalledWith({
        method,
        url,
        data,
        headers: mockNoAuthHeaders,
      });
    });

    it('should make a request with the correct parameters and default data', async () => {
      const data = {};
      await performUnauthenticatedRESTRequest(url, method);

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

      await performAuthenticatedRESTRequest(url, method, mockToken, data);

      expect(axios).toHaveBeenCalledWith({
        method,
        url,
        data,
        headers: mockAuthHeaders,
      });
    });

    it('should make an authenticated request with the correct parameters and default data', async () => {
      const data = {};

      await performAuthenticatedRESTRequest(url, method, mockToken);

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

    it('throws on non-2xx HTTP status', async () => {
      const logSpy = jest
        .spyOn(rendererLogger, 'rendererLogError')
        .mockImplementation();

      (axios as unknown as jest.Mock).mockResolvedValue({
        status: 500,
        data: { data: {}, errors: [] },
        headers: {},
      });

      await expect(
        performGraphQLRequest(
          url,
          mockToken,
          FetchAuthenticatedUserDetailsDocument,
        ),
      ).rejects.toThrow('HTTP error 500');

      expect(logSpy).toHaveBeenCalled();
    });

    it('throws when GraphQL errors are present', async () => {
      const logSpy = jest
        .spyOn(rendererLogger, 'rendererLogError')
        .mockImplementation();

      (axios as unknown as jest.Mock).mockResolvedValue({
        status: 200,
        data: { data: {}, errors: [{ message: 'boom' }] },
        headers: {},
      });

      await expect(
        performGraphQLRequest(
          url,
          mockToken,
          FetchAuthenticatedUserDetailsDocument,
        ),
      ).rejects.toThrow('GraphQL request returned errors');

      expect(logSpy).toHaveBeenCalled();
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

    it('throws on non-2xx HTTP status', async () => {
      const logSpy = jest
        .spyOn(rendererLogger, 'rendererLogError')
        .mockImplementation();

      const queryString = 'query Foo { repository { issue { title } } }';

      (axios as unknown as jest.Mock).mockResolvedValue({
        status: 502,
        data: { data: {}, errors: [] },
        headers: {},
      });

      await expect(
        performGraphQLRequestString(url, mockToken, queryString),
      ).rejects.toThrow('HTTP error 502');

      expect(logSpy).toHaveBeenCalled();
    });

    it('throws when GraphQL errors are present', async () => {
      const logSpy = jest
        .spyOn(rendererLogger, 'rendererLogError')
        .mockImplementation();

      const queryString = 'query Foo { repository { issue { title } } }';

      (axios as unknown as jest.Mock).mockResolvedValue({
        status: 200,
        data: { data: {}, errors: [{ message: 'graphql-error' }] },
        headers: {},
      });

      await expect(
        performGraphQLRequestString(url, mockToken, queryString),
      ).rejects.toThrow('GraphQL request returned errors');

      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('performAuthenticatedRESTRequest pagination', () => {
    it('combines paginated results on success', async () => {
      // First page -> next link
      (axios as unknown as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          data: [1, 2],
          headers: {
            link: '<https://example.com?page=2>; rel="next"',
          },
        })
        .mockResolvedValueOnce({
          status: 200,
          data: [3],
          headers: {
            link: undefined,
          },
        });

      const result = await performAuthenticatedRESTRequest<number[]>(
        url,
        method,
        mockToken,
        {},
        true,
      );

      expect(result).toEqual([1, 2, 3]);
    });

    it('throws on non-2xx status in pagination', async () => {
      const logSpy = jest
        .spyOn(rendererLogger, 'rendererLogError')
        .mockImplementation();

      // First page ok, second page error
      (axios as unknown as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          data: [1],
          headers: {
            link: '<https://example.com?page=2>; rel="next"',
          },
        })
        .mockResolvedValueOnce({
          status: 500,
          data: [],
          headers: {
            link: undefined,
          },
        });

      await expect(
        performAuthenticatedRESTRequest<number[]>(
          url,
          method,
          mockToken,
          {},
          true,
        ),
      ).rejects.toThrow('HTTP error 500');

      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('shouldRequestWithNoCache', () => {
    it('shouldRequestWithNoCache', () => {
      expect(
        shouldRequestWithNoCache(
          'https://example.com/api/v3/notifications' as Link,
        ),
      ).toBe(true);

      expect(
        shouldRequestWithNoCache(
          'https://example.com/login/oauth/access_token' as Link,
        ),
      ).toBe(true);

      expect(
        shouldRequestWithNoCache('https://example.com/notifications' as Link),
      ).toBe(true);

      expect(
        shouldRequestWithNoCache(
          'https://example.com/some/other/endpoint' as Link,
        ),
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
