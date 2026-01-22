import { Octokit } from '@octokit/core';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';

import type { Hostname, Token } from '../../types';

import { decryptValue } from '../comms';
import { getGitHubAPIBaseUrl } from './utils';

// Create the Octokit type with plugins
const OctokitWithPlugins = Octokit.plugin(paginateRest, restEndpointMethods);
export type OctokitClient = InstanceType<typeof OctokitWithPlugins>;

/**
 * Create an authenticated Octokit client instance
 *
 * @param hostname The account hostname
 * @param token A GitHub token (encrypted)
 * @returns An authenticated Octokit instance with pagination and REST endpoint plugins
 */
export async function createOctokitClient(
  hostname: Hostname,
  token: Token,
): Promise<OctokitClient> {
  const decryptedToken = (await decryptValue(token)) as Token;

  // Get the base API URL for the hostname
  const baseUrl = getGitHubAPIBaseUrl(hostname).toString().replace(/\/$/, '');

  return new OctokitWithPlugins({
    auth: decryptedToken,
    baseUrl,
  });
}
