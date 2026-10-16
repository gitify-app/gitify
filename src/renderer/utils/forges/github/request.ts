import { GraphqlResponseError } from '@octokit/graphql';

import type { Account } from '../../../types';

import { handleGraphQLResponseError } from '../../api/errors';
import { supportsIssueFields, supportsSubIssues } from './capabilities';
import type { TypedDocumentString } from './graphql/generated/graphql';
import { createOctokitClient } from './octokit';

/**
 * Opt into only the schema features supported by this account, preserving any
 * headers supplied by the caller (including other GraphQL features).
 */
function graphqlHeaders(account: Account, headers: Record<string, string> = {}) {
  const features = [
    headers['GraphQL-Features'],
    supportsSubIssues(account) ? 'sub_issues' : undefined,
    supportsIssueFields(account) ? 'issue_fields' : undefined,
  ].filter(Boolean);

  return features.length > 0 ? { ...headers, 'GraphQL-Features': features.join(',') } : headers;
}

/**
 * Perform a GraphQL API request with typed operation document.
 *
 * @param account - The authenticated account to make the request with.
 * @param query - The typed GraphQL operation document.
 * @param variables - The GraphQL operation variables.
 * @returns Resolves to a typed GitHub GraphQL response.
 */
export async function performGraphQLRequest<TResult, TVariables>(
  account: Account,
  query: TypedDocumentString<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const octokit = await createOctokitClient(account, 'graphql');

  try {
    return await octokit.graphql<TResult>(query.toString(), {
      ...variables,
      headers: graphqlHeaders(
        account,
        (variables as { headers?: Record<string, string> })?.headers,
      ),
    });
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
 * Useful for dynamically composed queries (e.g. merged queries built at runtime).
 *
 * @param account - The authenticated account to make the request with.
 * @param query - The raw GraphQL operation/query string.
 * @param variables - The GraphQL operation variables.
 * @returns Resolves to a typed GitHub GraphQL response.
 */
export async function performGraphQLRequestString<TResult>(
  account: Account,
  query: string,
  variables: Record<string, unknown>,
): Promise<TResult> {
  const octokit = await createOctokitClient(account, 'graphql');

  try {
    return await octokit.graphql<TResult>(query, {
      ...variables,
      headers: graphqlHeaders(account, variables.headers as Record<string, string> | undefined),
    });
  } catch (error) {
    if (error instanceof GraphqlResponseError) {
      handleGraphQLResponseError<TResult>('performGraphQLRequestString', error);
    } else {
      throw error;
    }
  }
}
