import { Octokit } from '@octokit/core';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';

import type { Account } from '../../types';

import { getAccountUUID } from '../auth/utils';
import { decryptValue, getAppVersion } from '../comms';
import { getGitHubAPIBaseUrl } from './utils';
import { APPLICATION } from '../../../shared/constants';

// Create the Octokit type with plugins
const OctokitWithPlugins = Octokit.plugin(paginateRest, restEndpointMethods);
export type OctokitClient = InstanceType<typeof OctokitWithPlugins>;

// Cache Octokit clients per account UUID
const octokitClientCache = new Map<string, OctokitClient>();

const version = getAppVersion()

/**
 * Clear the Octokit client cache
 * Useful when accounts are added/removed or tokens change
 */
export function clearOctokitClientCache(): void {
  octokitClientCache.clear();
}

/**
 * Create an authenticated Octokit client instance
 * Clients are cached per account UUID to avoid recreating them for every API call
 *
 * @param account The account to create the client for
 * @returns An authenticated Octokit instance with pagination and REST endpoint plugins
 */
export async function createOctokitClient(
  account: Account,
): Promise<OctokitClient> {
  const accountUUID = getAccountUUID(account);

  // Return cached client if it exists
  const cachedClient = octokitClientCache.get(accountUUID);
  if (cachedClient) {
    return cachedClient;
  }

  // Create new client
  const decryptedToken = await decryptValue(account.token);

  // Get the base API URL for the hostname
  const baseUrl = getGitHubAPIBaseUrl(account.hostname)
    .toString()
    .replace(/\/$/, '');

  const client = new OctokitWithPlugins({
    auth: decryptedToken,
    baseUrl,
    userAgent: `${APPLICATION.NAME}/${version}`
  });

  // Cache the client
  octokitClientCache.set(accountUUID, client);

  return client;
}
