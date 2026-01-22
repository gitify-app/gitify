import { Octokit } from '@octokit/core';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';

import type { Link, Token } from '../../types';

import { decryptValue } from '../comms';

/**
 * Create an authenticated Octokit client instance
 *
 * @param url The API url to determine the base URL
 * @param token A GitHub token (encrypted)
 * @returns An authenticated Octokit instance with pagination and REST endpoint plugins
 */
export async function createOctokitClient(
  url: Link,
  token: Token,
): Promise<Octokit> {
  const decryptedToken = (await decryptValue(token)) as Token;

  // Determine the base URL based on hostname
  const parsedUrl = new URL(url);
  const isGitHubEnterprise =
    parsedUrl.hostname !== 'api.github.com' &&
    parsedUrl.hostname !== 'github.com';

  let baseUrl = 'https://api.github.com';
  if (isGitHubEnterprise) {
    // For Enterprise Server, the API is typically at https://hostname/api/v3
    if (parsedUrl.pathname.includes('/api/v3')) {
      // Extract base URL from the path
      const pathParts = parsedUrl.pathname.split('/api/v3');
      baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${pathParts[0]}/api/v3`;
    } else {
      baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}/api/v3`;
    }
  }

  // Create Octokit instance with plugins
  const OctokitWithPlugins = Octokit.plugin(paginateRest, restEndpointMethods);

  return new OctokitWithPlugins({
    auth: decryptedToken,
    baseUrl,
  });
}
