import type { AxiosResponse } from 'axios';

import type { Link, Token } from '../../types';
import type { GitHubGraphQLResponse } from './graphql/types';

import { decryptValue } from '../comms';
import { rendererLogError } from '../logger';
import { assertNoGraphQLErrors } from './errors';
import type { TypedDocumentString } from './graphql/generated/graphql';
import { createOctokitClient } from './octokit';

/**
 * Perform an authenticated REST API request
 *
 * @param method The REST http method
 * @param url The API url
 * @param token A GitHub token (decrypted)
 * @param data The API request body
 * @param fetchAllRecords Whether to fetch all records or just the first page
 * @returns Resolves to a GitHub REST response with the specified type
 */
export async function performAuthenticatedRESTRequest<TResult>(
  method: string,
  url: Link,
  token: Token,
  data: Record<string, unknown> = {},
  fetchAllRecords = false,
): Promise<AxiosResponse<TResult>> {
  const octokit = await createOctokitClient(url, token);

  try {
    if (!fetchAllRecords) {
      // Single request without pagination
      const response = await octokit.request({
        // biome-ignore lint/suspicious/noExplicitAny: Octokit method type
        method: method.toUpperCase() as any,
        url,
        ...data,
      });

      // Return in AxiosResponse format for backward compatibility
      return {
        data: response.data as TResult,
        status: response.status,
        statusText: '',
        headers: response.headers,
        // biome-ignore lint/suspicious/noExplicitAny: AxiosResponse config type
        config: {} as any,
      } as AxiosResponse<TResult>;
    }

    // Fetch all pages using Octokit's pagination
    // biome-ignore lint/suspicious/noExplicitAny: Octokit paginate type
    const iterator = (octokit as any).paginate.iterator({
      // biome-ignore lint/suspicious/noExplicitAny: Octokit method type
      method: method.toUpperCase() as any,
      url,
      ...data,
    });

    let combinedData: unknown[] = [];

    for await (const response of iterator) {
      if (response.data) {
        combinedData = combinedData.concat(response.data);
      }
    }

    // Return the last response with combined data
    return {
      data: combinedData as TResult,
      status: 200,
      statusText: '',
      headers: {},
      // biome-ignore lint/suspicious/noExplicitAny: AxiosResponse config type
      config: {} as any,
    } as AxiosResponse<TResult>;
  } catch (err) {
    rendererLogError(
      'performAuthenticatedRESTRequest',
      'API request failed:',
      err,
    );

    throw err;
  }
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
  const octokit = await createOctokitClient(url, token);

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
  const octokit = await createOctokitClient(url, token);

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

/**
 * Determine if the API request should be made with no-cache header
 * based on the API url path
 *
 * @param url The API url
 * @returns Whether a cache heading should be set or not
 */
export function shouldRequestWithNoCache(url: Link): boolean {
  const parsedUrl = new URL(url);

  switch (parsedUrl.pathname) {
    case '/api/v3/notifications':
    case '/login/oauth/access_token':
    case '/notifications':
      return true;
    default:
      return false;
  }
}

/**
 * Construct headers for API requests
 *
 * @param username A GitHub account username
 * @param token A GitHub token (decrypted)
 * @returns A headers object to use with API requests
 */
export async function getHeaders(
  url: Link,
  token?: Token,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Cache-Control': shouldRequestWithNoCache(url) ? 'no-cache' : '',
    'Content-Type': 'application/json',
  };

  if (token) {
    const decryptedToken = (await decryptValue(token)) as Token;

    headers.Authorization = `token ${decryptedToken}`;
  }

  return headers;
}
