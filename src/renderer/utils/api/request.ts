import axios, { type AxiosResponse, type Method } from 'axios';
import type { ExecutionResult } from 'graphql';

import type { Link, Token } from '../../types';
import { decryptValue } from '../comms';
import { rendererLogError } from '../logger';
import { assertNoGraphQLErrors } from './errors';
import type { TypedDocumentString } from './graphql/generated/graphql';
import type { GitHubGraphQLResponse } from './types';
import { getNextURLFromLinkHeader } from './utils';

/**
 * Perform an unauthenticated REST API request
 *
 * @param url The API url
 * @param method The REST http method
 * @param data The API request body
 * @returns Resolves to a GitHub REST response
 */
export async function performUnauthenticatedRESTRequest<TResult>(
  url: Link,
  method: Method,
  data = {},
): Promise<TResult | null> {
  const headers = await getHeaders(url);

  return axios({
    method,
    url,
    data,
    headers,
  }).then((response) => {
    return response.data;
  }) as Promise<TResult>;
}

/**
 * Perform an authenticated REST API request
 *
 * @param url The API url
 * @param method The REST http method
 * @param token A GitHub token (decrypted)
 * @param data The API request body
 * @param fetchAllRecords Whether to fetch all records or just the first page
 * @returns Resolves to a GitHub REST response
 */
export async function performAuthenticatedRESTRequest<TResult>(
  url: Link,
  method: Method,
  token: Token,
  data = {},
  fetchAllRecords = false,
): Promise<TResult | null> {
  const headers = await getHeaders(url, token);

  if (!fetchAllRecords) {
    return axios({ method, url, data, headers });
  }

  let response: AxiosResponse<TResult> | null = null;
  let combinedData: unknown[] = [];

  try {
    let nextUrl: string | null = url;

    while (nextUrl) {
      response = await axios({ method, url: nextUrl, data, headers });

      // Ensure HTTP status indicates success
      if (response.status < 200 || response.status >= 300) {
        const err = new Error(`HTTP error ${response.status}`);
        rendererLogError(
          'performAuthenticatedRESTRequest',
          `HTTP error ${response.status} for ${nextUrl}`,
          err,
        );
        throw err;
      }

      // If no data is returned, break the loop
      if (!response?.data) {
        break;
      }

      // Accumulate paginated array results
      combinedData = combinedData.concat(response.data as unknown as unknown[]);

      nextUrl = getNextURLFromLinkHeader(response);
    }
  } catch (err) {
    rendererLogError(
      'performAuthenticatedRESTRequest',
      'API request failed:',
      err,
    );

    throw err;
  }

  // Return the combined array of records as the result data
  return combinedData as TResult;
}

/**
 * Perform a GraphQL API request with typed operation document
 *
 * @param url The API url
 * @param query The GraphQL operation/query statement TVariables
 * @param variables The GraphQL operation variables
 * @returns Resolves to a GitHub GraphQL response
 */
export async function performGraphQLRequest<TResult, TVariables>(
  url: Link,
  token: Token,
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const headers = await getHeaders(url, token);

  return axios({
    method: 'POST',
    url,
    data: {
      query,
      variables,
    },
    headers: headers,
  }).then((response) => {
    // Check GraphQL errors
    assertNoGraphQLErrors(
      'performGraphQLRequest',
      response.data as ExecutionResult<TResult>,
    );

    return {
      ...response.data,
      headers: response.headers,
    };
  }) as Promise<GitHubGraphQLResponse<TResult>>;
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
  const headers = await getHeaders(url, token);

  return axios({
    method: 'POST',
    url,
    data: {
      query,
      variables,
    },
    headers: headers,
  }).then((response) => {
    // Check GraphQL errors
    assertNoGraphQLErrors(
      'performGraphQLRequestString',
      response.data as ExecutionResult<TResult>,
    );

    return {
      ...response.data,
      headers: response.headers,
    } as GitHubGraphQLResponse<TResult>;
  });
}

/**
 * Determine if the API request should be made with no-cache header
 * based on the API url path
 *
 * @param url The API url
 * @returns Whether a cache heading should be set or not
 */
export function shouldRequestWithNoCache(url: Link) {
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
export async function getHeaders(url: Link, token?: Token) {
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
