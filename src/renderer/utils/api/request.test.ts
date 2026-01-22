import { mockToken } from '../../__mocks__/state-mocks';
import {
  mockAuthHeaders,
  mockNoAuthHeaders,
  mockNonCachedAuthHeaders,
} from './__mocks__/request-mocks';

import type { Link } from '../../types';

import { FetchAuthenticatedUserDetailsDocument } from './graphql/generated/graphql';
import type { OctokitClient } from './octokit';
import * as octokitModule from './octokit';
import {
  getHeaders,
  performAuthenticatedRESTRequest,
  performGraphQLRequest,
  performGraphQLRequestString,
  shouldRequestWithNoCache,
} from './request';

// Manually mock Octokit for these tests
jest.mock('@octokit/core', () => {
  const mockOctokit = {
    request: jest.fn(),
    graphql: jest.fn(),
    paginate: { iterator: jest.fn() },
  };

  const MockOctokitClass = jest.fn(() => mockOctokit);
  // biome-ignore lint/suspicious/noExplicitAny: Mock type
  (MockOctokitClass as any).plugin = jest.fn(() => MockOctokitClass);

  return { Octokit: MockOctokitClass };
});

jest.mock('@octokit/plugin-paginate-rest', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mock type
  paginateRest: jest.fn((octokit: any) => octokit),
}));

jest.mock('@octokit/plugin-rest-endpoint-methods', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mock type
  restEndpointMethods: jest.fn((octokit: any) => octokit),
}));

const url = 'https://example.com' as Link;
const method = 'get';

describe('renderer/utils/api/request.ts', () => {
  let mockOctokitInstance: {
    request: jest.Mock;
    graphql: jest.Mock;
    paginate: { iterator: jest.Mock };
  };

  beforeEach(() => {
    mockOctokitInstance = {
      request: jest.fn(),
      graphql: jest.fn(),
      paginate: { iterator: jest.fn() },
    };

    jest
      .spyOn(octokitModule, 'createOctokitClient')
      .mockResolvedValue(mockOctokitInstance as unknown as OctokitClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apiRequestAuth', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should make an authenticated request with the correct parameters', async () => {
      const data = { key: 'value' };
      mockOctokitInstance.request.mockResolvedValue({
        data: { result: 'success' },
        status: 200,
        headers: {},
      });

      await performAuthenticatedRESTRequest(method, url, mockToken, data);

      expect(mockOctokitInstance.request).toHaveBeenCalledWith({
        method: method.toUpperCase(),
        url,
        ...data,
      });
    });

    it('should make an authenticated request with the correct parameters and default data', async () => {
      const data = {};
      mockOctokitInstance.request.mockResolvedValue({
        data: { result: 'success' },
        status: 200,
        headers: {},
      });

      await performAuthenticatedRESTRequest(method, url, mockToken, data);

      expect(mockOctokitInstance.request).toHaveBeenCalledWith({
        method: method.toUpperCase(),
        url,
      });
    });
  });

  describe('performGraphQLRequest', () => {
    it('should performGraphQLRequest with the correct parameters and default data', async () => {
      mockOctokitInstance.graphql.mockResolvedValue({});

      await performGraphQLRequest(
        url,
        mockToken,
        FetchAuthenticatedUserDetailsDocument,
      );

      expect(mockOctokitInstance.graphql).toHaveBeenCalledWith(
        FetchAuthenticatedUserDetailsDocument.toString(),
        {},
      );
    });
  });

  describe('performGraphQLRequestString', () => {
    it('should performGraphQLRequestString with the correct parameters and default data', async () => {
      const queryString = 'query Foo { repository { issue { title } } }';
      mockOctokitInstance.graphql.mockResolvedValue({});

      await performGraphQLRequestString(url, mockToken, queryString);

      expect(mockOctokitInstance.graphql).toHaveBeenCalledWith(queryString, {});
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
