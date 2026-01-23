import { mockToken } from '../../__mocks__/state-mocks';

import type { Link } from '../../types';

import type { OctokitClient } from './octokit';
import * as octokitModule from './octokit';
import {
  performGraphQLRequestString,
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
// const method = 'get';

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

  
  describe('performGraphQLRequest', () => {
    // it('should performGraphQLRequest with the correct parameters and default data', async () => {
    //   mockOctokitInstance.graphql.mockResolvedValue({});

    //   await performGraphQLRequest(
    //     url,
    //     mockToken,
    //     FetchAuthenticatedUserDetailsDocument,
    //   );

    //   expect(mockOctokitInstance.graphql).toHaveBeenCalledWith(
    //     FetchAuthenticatedUserDetailsDocument.toString(),
    //     {},
    //   );
    // });
  });

  describe('performGraphQLRequestString', () => {
    it('should performGraphQLRequestString with the correct parameters and default data', async () => {
      const queryString = 'query Foo { repository { issue { title } } }';
      mockOctokitInstance.graphql.mockResolvedValue({});

      await performGraphQLRequestString(url, mockToken, queryString);

      expect(mockOctokitInstance.graphql).toHaveBeenCalledWith(queryString, {});
    });
  });

  
});
