import { Octokit } from '@octokit/core';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';

import { APPLICATION } from '../../../shared/constants';

import type { Account } from '../../types';
import type { APIClientType } from './types';

import { getAccountUUID } from '../auth/utils';
import { decryptValue, getAppVersion } from '../comms';
import { getGitHubAPIBaseUrl } from './utils';

// Create the Octokit type with plugins
const OctokitWithPlugins = Octokit.plugin(paginateRest, restEndpointMethods);
export type OctokitClient = InstanceType<typeof OctokitWithPlugins>;

// Cache Octokit clients per account UUID + type (rest|graphql)
const octokitClientCache = new Map<string, OctokitClient>();

const version = getAppVersion();

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
  type: APIClientType,
): Promise<OctokitClient> {
  const accountUUID = getAccountUUID(account);
  const cacheKey = `${accountUUID}:${type}`;

  // Return cached client if it exists
  const cachedClient = octokitClientCache.get(cacheKey);
  if (cachedClient) {
    return cachedClient;
  }

  // Create new client
  const decryptedToken = await decryptValue(account.token);

  // Get the base API URL for the hostname
  const baseUrl = getGitHubAPIBaseUrl(account.hostname, type)
    .toString()
    .replace(/\/$/, '');

  const userAgent = getUserAgent();

  const client = new OctokitWithPlugins({
    auth: decryptedToken,
    baseUrl,
    userAgent: userAgent,
  });

  // Cache the client keyed by account UUID + type
  octokitClientCache.set(cacheKey, client);

  return client;
}

/**
 * Format Gitify User Agent
 * @returns User Agent to be set for API requests
 */
export function getUserAgent() {
  return `${APPLICATION.NAME}/${version}`;
}
