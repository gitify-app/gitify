import type { AxiosResponse } from 'axios';
import type { Hostname } from '../../types';
import Constants from '../constants';
import { isEnterpriseHost } from '../helpers';

export function getGitHubAPIBaseUrl(hostname: Hostname): URL {
  const url = new URL(Constants.GITHUB_API_BASE_URL);

  if (isEnterpriseHost(hostname)) {
    url.hostname = hostname;
    url.pathname = '/api/v3/';
  }
  return url;
}

export function getGitHubGraphQLUrl(hostname: Hostname): URL {
  const url = new URL(Constants.GITHUB_API_GRAPHQL_URL);

  if (isEnterpriseHost(hostname)) {
    url.hostname = hostname;
    url.pathname = '/api/graphql';
  }

  return url;
}

export function parseNextUrl(response: AxiosResponse): string | null {
  const linkHeader = response.headers.link;
  const matches = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
  return matches ? matches[1] : null;
}
