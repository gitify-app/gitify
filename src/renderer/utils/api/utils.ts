import type { AxiosResponse } from 'axios';

import { Constants } from '../../constants';
import type { Hostname } from '../../types';
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

export function getNumberFromUrl(url: string): number {
  return Number.parseInt(url.split('/').pop(), 10);
}
