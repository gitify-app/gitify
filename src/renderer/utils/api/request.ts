import { GraphqlResponseError } from '@octokit/graphql';

import type { Account } from '../../types';

import { handleGraphQLResponseError } from './errors';
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
  variables: TVariables,
): Promise<TResult> {
  const octokit = await createOctokitClient(account, 'graphql');

  try {
    return await octokit.graphql<TResult>(query.toString(), variables || {});
  } catch (error) {
    if (error instanceof GraphqlResponseError) {
      handleGraphQLResponseError<TResult>('performGraphQLRequest', error);
    } else {
      throw error;
    }
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
  variables: Record<string, unknown>,
): Promise<TResult> {
  const octokit = await createOctokitClient(account, 'graphql');

  try {
    return await octokit.graphql<TResult>(query, variables || {});
  } catch (error) {
    if (error instanceof GraphqlResponseError) {
      handleGraphQLResponseError<TResult>('performGraphQLRequestString', error);
    } else {
      throw error;
    }
  }
}
