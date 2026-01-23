import type { Account } from '../../types';
import type { GitHubGraphQLResponse } from './graphql/types';

import { assertNoGraphQLErrors } from './errors';
import type { TypedDocumentString } from './graphql/generated/graphql';
import { createOctokitClient } from './octokit';

/**
 * Perform a GraphQL API request with typed operation document
 *
 * @param url The API url
 * @param query The GraphQL operation/query statement
 * @param variables The GraphQL operation variables
 * @returns Resolves to a GitHub GraphQL response
 */
export async function performGraphQLRequest<TResult, TVariables>(
  account: Account,
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<GitHubGraphQLResponse<TResult>> {
  const octokit = await createOctokitClient(account, 'graphql');

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
  account: Account,
  query: string,
  variables?: Record<string, unknown>,
): Promise<GitHubGraphQLResponse<TResult>> {
  const octokit = await createOctokitClient(account, 'graphql');

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
