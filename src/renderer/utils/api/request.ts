import axios, { type AxiosResponse, type Method } from 'axios';

import type { Link, Token } from '../../types';
import type { GitHubGraphQLResponse } from './graphql/types';

import { decryptValue } from '../comms';
import { rendererLogError } from '../logger';
import { assertNoGraphQLErrors } from './errors';
import type { TypedDocumentString } from './graphql/generated/graphql';
import { getNextURLFromLinkHeader } from './utils';

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
  method: Method,
  url: Link,
  token: Token,
  data: Record<string, unknown> = {},
  fetchAllRecords = false,
): Promise<AxiosResponse<TResult>> {
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

      // If no data is returned, break the loop
      if (!response?.data) {
        break;
      }

      // Accumulate paginated array results
      combinedData = combinedData.concat(response.data);

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

  // Return a response object with the combined array of records as data
  response.data = combinedData as TResult;
  return response;
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
    assertNoGraphQLErrors<TResult>('performGraphQLRequest', response.data);

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
    assertNoGraphQLErrors<TResult>(
      'performGraphQLRequestString',
      response.data,
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
