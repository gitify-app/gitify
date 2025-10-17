import { Octokit } from '@octokit/core';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';

import { logWarn } from '../../../shared/logger';
import type { Hostname, Token } from '../../types';
import { decryptValue } from '../comms';
import { getGitHubAPIBaseUrl } from './utils';

// Create the Octokit class with pagination plugin
const OctokitWithPagination = Octokit.plugin(restEndpointMethods, paginateRest);

/**
 * Create an Octokit client instance for a given hostname and token
 */
export async function createOctokitClient(
  hostname: Hostname,
  token: Token,
): Promise<InstanceType<typeof OctokitWithPagination>> {
  let apiToken = token;
  // TODO - Remove this try-catch block in a future release
  try {
    apiToken = (await decryptValue(token)) as Token;
  } catch (_err) {
    logWarn('createOctokitClient', 'Token is not yet encrypted');
  }

  const baseUrl = getGitHubAPIBaseUrl(hostname).toString();

  return new OctokitWithPagination({
    auth: apiToken,
    baseUrl: baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl,
  });
}

/**
 * Create an Octokit client instance from a direct token (already decrypted)
 */
export function createOctokitClientFromToken(
  hostname: Hostname,
  token: string,
): InstanceType<typeof OctokitWithPagination> {
  const baseUrl = getGitHubAPIBaseUrl(hostname).toString();

  return new OctokitWithPagination({
    auth: token,
    baseUrl: baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl,
  });
}
