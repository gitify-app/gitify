import { Octokit } from '@octokit/core';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';

import { APPLICATION } from '../../../../shared/constants';

import type { Account, Hostname } from '../../../types';
import type { APIClientType } from './types';

import { getAccountUUID } from '../../auth/utils';
import { decryptValue, getAppVersion } from '../../system/comms';
import { forgetGitHubCliToken, resolveGitHubCliToken } from './cli';
import { getGitHubAPIBaseUrl } from './utils';

// Create the Octokit type with plugins
const OctokitWithPlugins = Octokit.plugin(paginateRest, restEndpointMethods);
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
 * Clear the Octokit client cache for a specific account
 * Useful when an account token is refreshed or re-authenticated
 *
 * @param account The account to clear the cache for
 */
export function clearOctokitClientCacheForAccount(account: Account): void {
  octokitClientCache.delete(getClientCacheKey(account, 'rest'));
  octokitClientCache.delete(getClientCacheKey(account, 'graphql'));
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
  const isCliAccount = account.method === 'GitHub CLI';

  const version = await getAppVersion();
  const userAgent = `${APPLICATION.NAME}/${version}`;

  const baseUrl = getGitHubAPIBaseUrl(account.hostname, type).toString().replace(/\/$/, '');

  const client = new OctokitWithPlugins({
    auth: isCliAccount ? undefined : (await decryptValue(account.token)).token,
    baseUrl: baseUrl,
    userAgent: userAgent,
    retry: {
      retries: 1,
    },
  });

  if (isCliAccount) {
    authenticateFromCli(client, account.hostname);
  }

  return client;
}

/**
 * Authenticate every request from the GitHub CLI rather than from a token
 * baked in at construction, so a token the CLI rotates (`gh auth login`,
 * `gh auth refresh`) is picked up on the next request instead of stranding
 * this client until the account is refreshed.
 */
function authenticateFromCli(client: OctokitClient, hostname: Hostname): void {
  client.hook.wrap('request', async (request, options) => {
    const authorize = async () => ({
      ...options,
      headers: {
        ...options.headers,
        authorization: `token ${await resolveGitHubCliToken(hostname)}`,
      },
    });

    try {
      return await request(await authorize());
    } catch (err) {
      if (!isUnauthorized(err)) {
        throw err;
      }

      forgetGitHubCliToken(hostname);

      return await request(await authorize());
    }
  });
}

function isUnauthorized(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'status' in err && err.status === 401;
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
