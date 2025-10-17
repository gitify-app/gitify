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

const instance = Axios.create();
const axios = setupCache(instance, {
  location: 'client',

  interpretHeader: true,

  methods: ['get'],

  cachePredicate: {
    ignoreUrls: ['login/oauth/access_token', 'notifications'],
  },

  // Generate unique cache keys per account to prevent cross-account pollution
  generateKey: buildKeyGenerator((request: AxiosRequestConfigWithAccount) => {
    return {
      method: request.method,
      url: request.url,
      custom: request.account.user.id,
    };
  }),
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
 * @param token
 * @param skipCache - If true, adds cache-control: no-cache to force fresh data
 * @returns
 */
async function getHeaders(token?: Token) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  if (token) {
    const decryptedToken = (await decryptValue(token)) as Token;

    headers.Authorization = `token ${decryptedToken}`;
  }

  return headers;
}
