import Axios, {
  type AxiosPromise,
  type AxiosResponse,
  type Method,
} from 'axios';
import { buildKeyGenerator, setupCache } from 'axios-cache-interceptor';

import type { Link, Token } from '../../types';
import { decryptValue } from '../comms';
import { rendererLogError } from '../logger';
import { getNextURLFromLinkHeader } from './utils';

const instance = Axios.create();
const axios = setupCache(instance, {
  location: 'client',

  cachePredicate: {
    ignoreUrls: [
      '/login/oauth/access_token',
      // '/notifications',
      // '/api/v3/notifications',
    ],
  },

  generateKey: buildKeyGenerator((request) => ({
    method: request.method,
    url: request.url,
    custom: request.auth,
  })),
});

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
): Promise<AxiosPromise | null> {
  const headers = await getHeaders();

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
): AxiosPromise | null {
  const headers = await getHeaders(token);

  if (!fetchAllRecords) {
    return axios({ method, url, data, headers });
  }

  let response: AxiosResponse | null = null;
  let combinedData = [];

  try {
    let nextUrl: string | null = url;

    while (nextUrl) {
      response = await axios({
        method,
        url: nextUrl,
        data,
        headers,
      });

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
 * Construct headers for API requests
 *
 * @param username
 * @param token
 * @returns
 */
async function getHeaders(token?: Token) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    const decryptedToken = (await decryptValue(token)) as Token;

    headers.Authorization = `token ${decryptedToken}`;
  }

  return headers;
}
