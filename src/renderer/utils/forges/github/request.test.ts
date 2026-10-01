import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../../__mocks__/account-mocks';

import { FetchIssueByNumberDocument } from './graphql/generated/graphql';
import type { OctokitClient } from './octokit';
import * as octokitModule from './octokit';
import { performGraphQLRequest, performGraphQLRequestString } from './request';

const GRAPHQL_FEATURES_HEADER = { 'GraphQL-Features': 'sub_issues,issue_fields' };

// Manually mock Octokit for these tests
vi.mock('@octokit/core', () => {
  const mockOctokit = {
    request: vi.fn(),
    graphql: vi.fn(),
    paginate: { iterator: vi.fn() },
  };

  const MockOctokitClass = vi.fn(() => mockOctokit);
  // oxlint-disable-next-line typescript/no-explicit-any -- Mock type
  (MockOctokitClass as any).plugin = vi.fn(() => MockOctokitClass);

  return { Octokit: MockOctokitClass };
});

vi.mock('@octokit/plugin-paginate-rest', () => ({
  // oxlint-disable-next-line typescript/no-explicit-any -- Mock type
  paginateRest: vi.fn((octokit: any) => octokit),
}));

vi.mock('@octokit/plugin-rest-endpoint-methods', () => ({
  // oxlint-disable-next-line typescript/no-explicit-any -- Mock type
  restEndpointMethods: vi.fn((octokit: any) => octokit),
}));

describe('renderer/utils/forges/github/request.ts', () => {
  let mockOctokitInstance: {
    request: ReturnType<typeof vi.fn>;
    graphql: ReturnType<typeof vi.fn>;
    paginate: { iterator: ReturnType<typeof vi.fn> };
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

  it('performGraphQLRequest - perform call with correct params', async () => {
    mockOctokitInstance.graphql.mockResolvedValue({});

    await performGraphQLRequest(mockGitHubCloudAccount, FetchIssueByNumberDocument, {
      owner: 'test',
      name: 'repo',
      number: 1,
    });

    expect(createOctokitClientSpy).toHaveBeenCalledWith(mockGitHubCloudAccount, 'graphql');
    expect(mockOctokitInstance.graphql).toHaveBeenCalledWith(
      FetchIssueByNumberDocument.toString(),
      { owner: 'test', name: 'repo', number: 1, headers: GRAPHQL_FEATURES_HEADER },
    );
  });

  it('performGraphQLRequestString - perform call with correct params', async () => {
    const queryString = 'query Foo { repository { issue { title } } }';
    mockOctokitInstance.graphql.mockResolvedValue({});

    await performGraphQLRequestString(mockGitHubCloudAccount, queryString, {});

    expect(createOctokitClientSpy).toHaveBeenCalledWith(mockGitHubCloudAccount, 'graphql');
    expect(mockOctokitInstance.graphql).toHaveBeenCalledWith(queryString, {
      headers: GRAPHQL_FEATURES_HEADER,
    });
  });

  it('preserves custom headers and feature flags', async () => {
    mockOctokitInstance.graphql.mockResolvedValue({});

    await performGraphQLRequestString(mockGitHubCloudAccount, 'query Test { viewer { login } }', {
      headers: { 'X-Request-Id': 'test', 'GraphQL-Features': 'other_feature' },
    });

    expect(mockOctokitInstance.graphql).toHaveBeenCalledWith('query Test { viewer { login } }', {
      headers: {
        'X-Request-Id': 'test',
        'GraphQL-Features': 'other_feature,sub_issues,issue_fields',
      },
    });
  });

  it.each([
    ['3.16.5', undefined],
    ['3.17.0', 'sub_issues'],
    ['3.23.0', 'sub_issues,issue_fields'],
  ])('only sends supported feature flags for GHES %s', async (version, features) => {
    mockOctokitInstance.graphql.mockResolvedValue({});

    await performGraphQLRequestString(
      { ...mockGitHubEnterpriseServerAccount, version },
      'query Test { viewer { login } }',
      {},
    );

    expect(mockOctokitInstance.graphql).toHaveBeenCalledWith('query Test { viewer { login } }', {
      headers: features ? { 'GraphQL-Features': features } : {},
    });
  });
});
