import type { AxiosPromise, Method } from 'axios';

import type { Link, Token } from '../../types';
import { octokitRequest, octokitRequestAuth } from './octokit-request';

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
): AxiosPromise<any> {
  // Use Octokit for new requests
  return octokitRequest(url, method as any, data) as any;
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
): Promise<any> {
  // Use Octokit for new requests
  return octokitRequestAuth(url, method as any, token, data, fetchAllRecords) as any;
}
