import type { Hostname } from '../../types';
import Constants from '../constants';
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
