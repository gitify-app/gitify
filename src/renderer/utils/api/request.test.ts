import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';

import { FetchIssueByNumberDocument } from './graphql/generated/graphql';
import type { OctokitClient } from './octokit';
import * as octokitModule from './octokit';
import { performGraphQLRequest, performGraphQLRequestString } from './request';

// Manually mock Octokit for these tests
vi.mock('@octokit/core', () => {
  const mockOctokit = {
    request: vi.fn(),
    graphql: vi.fn(),
    paginate: { iterator: vi.fn() },
  };

  const MockOctokitClass = vi.fn(() => mockOctokit);
  // biome-ignore lint/suspicious/noExplicitAny: Mock type
  (MockOctokitClass as any).plugin = vi.fn(() => MockOctokitClass);

  return { Octokit: MockOctokitClass };
});

vi.mock('@octokit/plugin-paginate-rest', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mock type
  paginateRest: vi.fn((octokit: any) => octokit),
}));

vi.mock('@octokit/plugin-rest-endpoint-methods', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mock type
  restEndpointMethods: vi.fn((octokit: any) => octokit),
}));

describe('renderer/utils/api/request.ts', () => {
  let mockOctokitInstance: {
    request: vi.Mock;
    graphql: vi.Mock;
    paginate: { iterator: vi.Mock };
  };

  const createOctokitClientSpy = vi.spyOn(octokitModule, 'createOctokitClient');

  beforeEach(() => {
    mockOctokitInstance = {
      request: vi.fn(),
      graphql: vi.fn(),
      paginate: { iterator: vi.fn() },
    };

    vi.spyOn(octokitModule, 'createOctokitClient').mockResolvedValue(
      mockOctokitInstance as unknown as OctokitClient,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('performGraphQLRequest - perform call with correct params', async () => {
    mockOctokitInstance.graphql.mockResolvedValue({});

    await performGraphQLRequest(
      mockGitHubCloudAccount,
      FetchIssueByNumberDocument,
      { owner: 'test', name: 'repo', number: 1 },
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
