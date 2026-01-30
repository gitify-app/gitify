import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';

import { FetchIssueByNumberDocument } from './graphql/generated/graphql';
import type { OctokitClient } from './octokit';
import * as octokitModule from './octokit';
import { performGraphQLRequest, performGraphQLRequestString } from './request';

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

describe('renderer/utils/api/request.ts', () => {
  let mockOctokitInstance: {
    request: jest.Mock;
    graphql: jest.Mock;
    paginate: { iterator: jest.Mock };
  };

  const createOctokitClientSpy = jest.spyOn(
    octokitModule,
    'createOctokitClient',
  );

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

  it('performGraphQLRequest - perform call with correct params', async () => {
    mockOctokitInstance.graphql.mockResolvedValue({});

    await performGraphQLRequest(
      mockGitHubCloudAccount,
      FetchIssueByNumberDocument,
      { owner: 'test', name: 'repo', number: 1, includeMetrics: true },
    );

    expect(createOctokitClientSpy).toHaveBeenCalledWith(
      mockGitHubCloudAccount,
      'graphql',
    );
    expect(mockOctokitInstance.graphql).toHaveBeenCalledWith(
      FetchIssueByNumberDocument.toString(),
      { owner: 'test', name: 'repo', number: 1 },
    );
  });

  it('performGraphQLRequestString - perform call with correct params', async () => {
    const queryString = 'query Foo { repository { issue { title } } }';
    mockOctokitInstance.graphql.mockResolvedValue({});

    await performGraphQLRequestString(mockGitHubCloudAccount, queryString, {});

    expect(createOctokitClientSpy).toHaveBeenCalledWith(
      mockGitHubCloudAccount,
      'graphql',
    );
    expect(mockOctokitInstance.graphql).toHaveBeenCalledWith(queryString, {});
  });
});
