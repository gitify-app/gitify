
import type { Hostname, Link, Token } from '../../types';
import type { GitHubGraphQLResponse } from './graphql/types';

import { assertNoGraphQLErrors } from './errors';
import type { TypedDocumentString } from './graphql/generated/graphql';
import { createOctokitClient } from './octokit';

/**
 * Extract hostname from a GitHub API URL
 */
function extractHostnameFromUrl(url: Link): Hostname {
  const parsedUrl = new URL(url);
  // For api.github.com URLs, return github.com
  if (parsedUrl.hostname === 'api.github.com') {
    return 'github.com' as Hostname;
  }
  return parsedUrl.hostname as Hostname;
}



/**
 * Perform a GraphQL API request with typed operation document
 *
 * @param url The API url
 * @param query The GraphQL operation/query statement
 * @param variables The GraphQL operation variables
 * @returns Resolves to a GitHub GraphQL response
 */
export async function performGraphQLRequest<TResult, TVariables>(
  url: Link,
  token: Token,
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<GitHubGraphQLResponse<TResult>> {
  const hostname = extractHostnameFromUrl(url);
  const octokit = await createOctokitClient(hostname, token);

  try {
    const response = await octokit.graphql<TResult>(
      query.toString(),
      variables || {},
    );

    const graphqlResponse = {
      data: response,
      errors: [],
      headers: {},
    };

    assertNoGraphQLErrors<TResult>('performGraphQLRequest', graphqlResponse);

    return graphqlResponse;
    // biome-ignore lint/suspicious/noExplicitAny: GraphQL error type
  } catch (error: any) {
    // Handle GraphQL errors from Octokit
    if (error.errors) {
      const graphqlResponse = {
        data: error.data || ({} as TResult),
        errors: error.errors,
        headers: {},
      };
      assertNoGraphQLErrors<TResult>('performGraphQLRequest', graphqlResponse);
      return graphqlResponse;
    }
    throw error;
  }
}

/**
 * Perform a GraphQL API request using a raw query string instead of a TypedDocumentString.
 *
 * Useful for dynamically composed queries (e.g: merged queries built at runtime).
 *
 * @param url The API url
 * @param token The GitHub token (decrypted)
 * @param query The GraphQL operation/query statement
 * @param variables The GraphQL operation variables
 * @returns Resolves to a GitHub GraphQL response
 */
export async function performGraphQLRequestString<TResult>(
  url: Link,
  token: Token,
  query: string,
  variables?: Record<string, unknown>,
): Promise<GitHubGraphQLResponse<TResult>> {
  const hostname = extractHostnameFromUrl(url);
  const octokit = await createOctokitClient(hostname, token);

  try {
    const response = await octokit.graphql<TResult>(query, variables || {});

    const graphqlResponse = {
      data: response,
      errors: [],
      headers: {},
    };

    assertNoGraphQLErrors<TResult>(
      'performGraphQLRequestString',
      graphqlResponse,
    );

    return graphqlResponse;
    // biome-ignore lint/suspicious/noExplicitAny: GraphQL error type
  } catch (error: any) {
    // Handle GraphQL errors from Octokit
    if (error.errors) {
      const graphqlResponse = {
        data: error.data || ({} as TResult),
        errors: error.errors,
        headers: {},
      };
      assertNoGraphQLErrors<TResult>(
        'performGraphQLRequestString',
        graphqlResponse,
      );
      return graphqlResponse;
    }
    throw error;
  }
}

