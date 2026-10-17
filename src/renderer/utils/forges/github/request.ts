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
 * A single failure from a GraphQL response that also carried usable data.
 * Only the fields Gitify needs are kept, so callers do not depend on Octokit.
 */
export interface PartialGraphQLFailure {
  message: string;
  path?: ReadonlyArray<string | number>;
  extensions?: Record<string, unknown>;
}

/** A GraphQL response that keeps whatever data arrived alongside its errors. */
export interface PartialGraphQLResult<TResult> {
  data: TResult | undefined;
  failures: PartialGraphQLFailure[];
}

/**
 * Perform a GraphQL request that tolerates a response carrying both `data` and
 * `errors`.
 *
 * GitHub returns this shape when one organization in a multi-organization
 * request blocks access: the query succeeds overall while individual fields
 * fail. The strict helpers above must keep throwing for their callers, so this
 * variant is separate and returns the partial data with the failures instead.
 *
 * @param account - The authenticated account to make the request with.
 * @param query - The raw GraphQL query string.
 * @param variables - The GraphQL query variables.
 * @returns The partial data and any failures reported alongside it.
 */
export async function performGraphQLRequestStringTolerant<TResult>(
  account: Account,
  query: string,
  variables: Record<string, unknown>,
): Promise<PartialGraphQLResult<TResult>> {
  const octokit = await createOctokitClient(account, 'graphql');

  try {
    const data = await octokit.graphql<TResult>(query, {
      ...variables,
      headers: graphqlHeaders(account, variables.headers as Record<string, string> | undefined),
    });

    return { data, failures: [] };
  } catch (error) {
    if (error instanceof GraphqlResponseError) {
      return {
        data: (error.data ?? undefined) as TResult | undefined,
        failures: (error.errors ?? []).map((graphQLError) => ({
          message: graphQLError.message,
          path: graphQLError.path,
          extensions: graphQLError.extensions,
        })),
      };
    }

    throw error;
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
