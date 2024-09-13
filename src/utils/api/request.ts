import axios, {
  type AxiosResponse,
  type AxiosPromise,
  type Method,
} from 'axios';
import log from 'electron-log';
import type { Link, Token } from '../../types';
import { getNextURLFromLinkHeader } from './utils';

/**
 * Perform an unauthenticated API request
 *
 * @param url
 * @param method
 * @param data
 * @returns
 */
export function apiRequest(
  url: Link,
  method: Method,
  data = {},
): AxiosPromise | null {
  axios.defaults.headers.common.Accept = 'application/json';
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Cache-Control'] = 'no-cache';
  return axios({ method, url, data });
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
  axios.defaults.headers.common.Accept = 'application/json';
  axios.defaults.headers.common.Authorization = `token ${token}`;
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Cache-Control'] = shouldRequestWithNoCache(url)
    ? 'no-cache'
    : '';

  if (!fetchAllRecords) {
    return axios({ method, url, data });
  }

  let response: AxiosResponse | null = null;
  let combinedData = [];

  try {
    let nextUrl: string | null = url;

    while (nextUrl) {
      response = await axios({ method, url: nextUrl, data });

      // If no data is returned, break the loop
      if (!response?.data) {
        break;
      }

      combinedData = combinedData.concat(response.data); // Accumulate data

      nextUrl = getNextURLFromLinkHeader(response);
    }
  } catch (error) {
    log.error('API request failed:', error);
    throw error;
  }

  return {
    ...response,
    data: combinedData,
  } as AxiosResponse;
}

/**
 * Return true if the request should be made with no-cache
 *
 * @param url
 * @returns boolean
 */
function shouldRequestWithNoCache(url: string) {
  const parsedUrl = new URL(url);

  switch (parsedUrl.pathname) {
    case '/notifications':
      return true;
    default:
      return false;
  }
}
