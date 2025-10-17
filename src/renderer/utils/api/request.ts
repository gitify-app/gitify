import Axios, {
  type AxiosPromise,
  type AxiosRequestConfig,
  type AxiosResponse,
  type Method,
} from 'axios';
import { buildKeyGenerator, setupCache } from 'axios-cache-interceptor';

import type { Account, Link, Token } from '../../types';
import { decryptValue } from '../comms';
import { rendererLogError } from '../logger';
import { getNextURLFromLinkHeader } from './utils';

type AxiosRequestConfigWithAccount = AxiosRequestConfig & { account: Account };

const MUTATION_HTTP_METHODS: Set<Method> = new Set(['PATCH', 'PUT', 'DELETE']);

const instance = Axios.create();
const axios = setupCache(instance, {
  location: 'client',

  // Respect ETags and cache headers from GitHub API
  interpretHeader: true,

  // Set a reasonable TTL to ensure cache freshness (60 seconds)
  // This ensures external changes (GitHub web/mobile) are picked up periodically
  // ttl: 1000 * 60, // 60 seconds

  cachePredicate: {
    ignoreUrls: ['/login/oauth/access_token'],
  },

  methods: ['get'],

  generateKey: buildKeyGenerator((request: AxiosRequestConfigWithAccount) => {
    return {
      method: request.method,
      url: request.url,
      custom: request.account.user.id,
    };
  }),
});

// Invalidate cache on mutating requests (PATCH, PUT, DELETE)
// Only clears cache entries for the same account that made the mutation
axios.interceptors.response.use(
  async (response) => {
    const method = response.config.method?.toUpperCase() as Method;
    const config = response.config as AxiosRequestConfigWithAccount;

    if (MUTATION_HTTP_METHODS.has(method) && config.account) {
      await clearFullApiCache();
    }
    return response;
  },
  (error: Error) => {
    // Pass through errors without clearing cache
    return Promise.reject(error);
  },
);

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
 * @param account
 * @param data
 * @param fetchAllRecords whether to fetch all records or just the first page
 * @returns
 */
export async function apiRequestAuth(
  url: Link,
  method: Method,
  account: Account,
  data: Record<string, unknown> = {},
  fetchAllRecords = false,
): AxiosPromise | null {
  const headers = await getHeaders(account.token);

  const baseConfig: AxiosRequestConfigWithAccount = {
    method,
    url,
    data,
    headers,
    account,
  };

  if (!fetchAllRecords) {
    return axios(baseConfig);
  }

  let response: AxiosResponse | null = null;
  let combinedData: unknown[] = [];

  try {
    let nextUrl: string | null = url;

    while (nextUrl) {
      const cfg: AxiosRequestConfigWithAccount = {
        ...baseConfig,
        url: nextUrl,
      };
      response = await axios(cfg);

      // If no data is returned, break the loop
      if (!response?.data) {
        break;
      }

      combinedData = combinedData.concat(response.data as unknown[]); // Accumulate data

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

export async function clearFullApiCache(): Promise<void> {
  try {
    axios.storage.clear();
  } catch (err) {
    rendererLogError('clearFullApiCache', 'Failed to clear API cache', err);
  }
}
