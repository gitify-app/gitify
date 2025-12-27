import axios, { type AxiosResponse, type Method } from 'axios';
import type { ExecutionResult } from 'graphql';

import type { Link, Token } from '../../types';
import { decryptValue } from '../comms';
import { isTauriEnvironment } from '../environment';
import { rendererLogError } from '../logger';
import type { TypedDocumentString } from './graphql/generated/graphql';
import { getNextURLFromLinkHeader } from './utils';

/**
 * Tauri HTTP client wrapper
 * Uses Tauri's HTTP plugin which bypasses WebView CORS restrictions
 */
async function tauriFetch(
  url: string,
  method: string,
  headers: Record<string, string>,
  data?: unknown,
): Promise<AxiosResponse> {
  // Dynamically import to avoid issues in browser mode
  const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');

  // HEAD and GET requests cannot have a body
  const canHaveBody = !['HEAD', 'GET'].includes(method.toUpperCase());

  const response = await tauriFetch(url, {
    method: method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD',
    headers,
    body: canHaveBody && data ? JSON.stringify(data) : undefined,
  });

  // Parse response body based on content type
  let responseData: unknown;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    responseData = await response.text();
  }

  // Convert Tauri response to axios-like response
  const headersObj: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  // Extract link header for pagination
  const linkHeader = response.headers.get('link');
  if (linkHeader) {
    headersObj.link = linkHeader;
  }

  return {
    data: responseData,
    status: response.status,
    statusText: response.statusText,
    headers: headersObj,
    config: {} as AxiosResponse['config'],
    request: {},
  };
}

/**
 * ExecutionResult with HTTP response headers
 */
export type ExecutionResultWithHeaders<T> = ExecutionResult<T> & {
  headers: Record<string, string>;
};

/**
 * Perform an unauthenticated API request
 *
 * @param url
 * @param method
 * @param data
 * @returns
 */
export async function apiRequest(
  url: Link,
  method: Method,
  data = {},
): Promise<AxiosResponse> {
  const headers = await getHeaders(url);

  // Use Tauri HTTP plugin in Tauri mode to bypass CORS
  if (isTauriEnvironment()) {
    return tauriFetch(url, method, headers, data);
  }

  return axios({ method, url, data, headers });
}

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
): Promise<AxiosResponse> {
  const headers = await getHeaders(url, token);
  const useTauri = isTauriEnvironment();

  // Helper function to make a single request
  const makeRequest = async (requestUrl: string): Promise<AxiosResponse> => {
    if (useTauri) {
      return tauriFetch(requestUrl, method, headers, data);
    }
    return axios({ method, url: requestUrl, data, headers });
  };

  if (!fetchAllRecords) {
    return makeRequest(url);
  }

  let response: AxiosResponse | null = null;
  let combinedData: unknown[] = [];

  try {
    let nextUrl: string | null = url;

    while (nextUrl) {
      response = await makeRequest(nextUrl);

      // If no data is returned, break the loop
      if (!response?.data) {
        break;
      }

      combinedData = combinedData.concat(response.data); // Accumulate data

      nextUrl = getNextURLFromLinkHeader(response);
    }
  } catch (err) {
    rendererLogError('apiRequestAuth', 'API request failed:', err as Error);

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
  const requestData = { query, variables };

  // Use Tauri HTTP plugin in Tauri mode to bypass CORS
  if (isTauriEnvironment()) {
    const response = await tauriFetch(url, 'POST', headers, requestData);
    return {
      ...response.data,
      headers: response.headers,
    } as ExecutionResultWithHeaders<TResult>;
  }

  return axios({
    method: 'POST',
    url,
    data: requestData,
    headers: headers,
  }).then((response) => {
    return {
      ...response.data,
      headers: response.headers,
    };
  }) as Promise<ExecutionResultWithHeaders<TResult>>;
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
