import axios, {
  type AxiosResponse,
  type AxiosPromise,
  type Method,
} from 'axios';
import log from 'electron-log';
import type { Link, Token } from '../../types';
import { parseNextUrl } from './utils';

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

export async function apiRequestAuth(
  url: Link,
  method: Method,
  token: Token,
  data = {},
  paginated = false,
): AxiosPromise | null {
  axios.defaults.headers.common.Accept = 'application/json';
  axios.defaults.headers.common.Authorization = `token ${token}`;
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Cache-Control'] = shouldRequestWithNoCache(url)
    ? 'no-cache'
    : '';

  if (!paginated) {
    return axios({ method, url, data });
  }

  let response: AxiosResponse | null = null;
  let combinedData = [];

  try {
    let nextUrl: string | null = url;

    while (nextUrl) {
      response = await axios({ method, url: nextUrl, data });
      combinedData = combinedData.concat(response.data); // Accumulate data

      nextUrl = parseNextUrl(response);
    }
  } catch (error) {
    log.error('API request failed:', error);
    return null;
  }

  return {
    ...response,
    data: combinedData,
  } as AxiosResponse;
}

function shouldRequestWithNoCache(url: string) {
  const parsedUrl = new URL(url);

  switch (parsedUrl.pathname) {
    case '/notifications':
      return true;
    default:
      return false;
  }
}
