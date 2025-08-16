import type { AxiosResponse } from 'axios';

import type { Hostname } from '../../types';
import { Constants } from '../constants';
import { isEnterpriseServerHost } from '../helpers';

export function getGitHubAPIBaseUrl(hostname: Hostname): URL {
  const url = new URL(Constants.GITHUB_API_BASE_URL);

  if (isEnterpriseServerHost(hostname)) {
    url.hostname = hostname;
    url.pathname = '/api/v3/';
  }
  return url;
}

export function getGitHubGraphQLUrl(hostname: Hostname): URL {
  const url = new URL(Constants.GITHUB_API_GRAPHQL_URL);

  if (isEnterpriseServerHost(hostname)) {
    url.hostname = hostname;
    url.pathname = '/api/graphql';
  }

  return url;
}

export function getNextURLFromLinkHeader(
  response: AxiosResponse,
): string | null {
  const linkHeader = response.headers.link;
  const matches = linkHeader?.match(/<([^<>]+)>;\s*rel="next"/);
  return matches ? matches[1] : null;
}

/**
 * Return true if the request should be made with no-cache
 *
 * @param url
 * @returns boolean
 */
export function shouldRequestWithNoCache(url: string): boolean {
  const parsedUrl = new URL(url);

  switch (parsedUrl.pathname) {
    case '/notifications':
    case '/api/v3/notifications':
      return true;
    default:
      return false;
  }
}
