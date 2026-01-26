import { Octokit } from '@octokit/core';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';
import { retry } from '@octokit/plugin-retry';

import { APPLICATION } from '../../../shared/constants';

import type { Account } from '../../types';
import type { APIClientType } from './types';

import { getAccountUUID } from '../auth/utils';
import { decryptValue, getAppVersion } from '../comms';
import { getGitHubAPIBaseUrl } from './utils';

// Create the Octokit type with plugins
const OctokitWithPlugins = Octokit.plugin(
  paginateRest,
  restEndpointMethods,
  retry,
);
export type OctokitClient = InstanceType<typeof OctokitWithPlugins>;

// Cache Octokit clients per account UUID + type (rest|graphql)
const octokitClientCache = new Map<string, OctokitClient>();

/**
 * Clear the Octokit client cache
 * Useful when accounts are added/removed or tokens change
 */
export function clearOctokitClientCache(): void {
  octokitClientCache.clear();
}

/**
 * Create an authenticated Octokit client instance with caching
 * Clients are cached to avoid recreating them for every API call
 *
 * @param account The account to create the client for
 * @param type The api client type (rest | graphql)
 * @returns A cached authenticated Octokit instance
 */
export async function createOctokitClient(
  account: Account,
  type: APIClientType,
): Promise<OctokitClient> {
  const cacheKey = getClientCacheKey(account, type);

  // Return cached client if it exists
  const cachedClient = octokitClientCache.get(cacheKey);
  if (cachedClient) {
    return cachedClient;
  }

  const client = await createOctokitClientUncached(account, type);
  octokitClientCache.set(cacheKey, client);

  return client;
}

/**
 * Create an authenticated Octokit client instance without caching
 * Useful when fresh data is needed (e.g., user details during account setup)
 *
 * @param account The account to create the client for
 * @param type The api client type (rest | graphql)
 * @returns A fresh authenticated Octokit instance
 */
export async function createOctokitClientUncached(
  account: Account,
  type: APIClientType,
): Promise<OctokitClient> {
  const decryptedToken = await decryptValue(account.token);

  const version = await getAppVersion();
  const userAgent = `${APPLICATION.NAME}/${version}`;

  const baseUrl = getGitHubAPIBaseUrl(account.hostname, type)
    .toString()
    .replace(/\/$/, '');

  return new OctokitWithPlugins({
    auth: decryptedToken,
    baseUrl: baseUrl,
    userAgent: userAgent,
    retry: {
      retries: 1,
    },
  });
}

/**
 * Calculate client cache key for account and api type
 *
 * @param account The Gitify account
 * @param type The API client type
 * @returns cache key
 */
export function getClientCacheKey(account: Account, type: APIClientType) {
  const accountUUID = getAccountUUID(account);
  return `${accountUUID}:${type}`;
}
