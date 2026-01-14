import axios, {
  type AxiosPromise,
  type AxiosResponse,
  type Method,
} from 'axios';
import type { ExecutionResult } from 'graphql';

import type { Link, Token } from '../../types';
import { decryptValue } from '../comms';
import { rendererLogError } from '../logger';
import type { TypedDocumentString } from './graphql/generated/graphql';
import { getNextURLFromLinkHeader } from './utils';

/**
 * ExecutionResult with HTTP response headers
 */
export type ExecutionResultWithHeaders<T> = ExecutionResult<T> & {
  headers: Record<string, string>;
};

/**
 * Perform an authenticated API request
 *
 * @param url
 * @param method
 * @param token
 * @param data
 * @param fetchAllRecords whether to fetch all records or just the first page
 * @returns
 */
export async function apiRequestAuth(
  url: Link,
  method: Method,
  token: Token,
  data = {},
  fetchAllRecords = false,
): AxiosPromise | null {
  const headers = await getHeaders(url, token);

  if (!fetchAllRecords) {
    return axios({ method, url, data, headers });
  }

  let response: AxiosResponse | null = null;
  let combinedData = [];

  try {
    let nextUrl: string | null = url;

    while (nextUrl) {
      response = await axios({ method, url: nextUrl, data, headers });

      // If no data is returned, break the loop
      if (!response?.data) {
        break;
      }

      combinedData = combinedData.concat(response.data); // Accumulate data

      nextUrl = getNextURLFromLinkHeader(response);
    }
  } catch (err) {
    rendererLogError('apiRequestAuth', 'API request failed:', err);

    throw err;
  }

  return {
    ...response,
    data: combinedData,
  } as AxiosResponse;
}

/**
 * Perform a GraphQL API request for account
 *
 * @param account
 * @param query
 * @param variables
 * @returns
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
    return {
      ...response.data,
      headers: response.headers,
    };
  }) as Promise<ExecutionResultWithHeaders<TResult>>;
}

/**
 * Perform a GraphQL API request using a raw query string instead of a TypedDocumentString.
 *
 * Useful for dynamically composed queries (e.g., merged queries built at runtime).
 */
export async function performGraphQLRequestString<TResult>(
  url: Link,
  token: Token,
  query: string,
  variables?: Record<string, unknown>,
): Promise<ExecutionResultWithHeaders<TResult>> {
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
    return {
      ...response.data,
      headers: response.headers,
    } as ExecutionResultWithHeaders<TResult>;
  });
}

/**
 * Return true if the request should be made with no-cache
 *
 * @param url
 * @returns boolean
 */
export function shouldRequestWithNoCache(url: string) {
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
 * @param username
 * @param token
 * @returns
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
