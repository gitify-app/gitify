import { APPLICATION } from '../../../shared/constants';

import { Constants } from '../../constants';

import type { Hostname } from '../../types';
import type { APIClientType } from './types';

import { isEnterpriseServerHost } from '../helpers';

export function getGitHubAuthBaseUrl(hostname: Hostname): URL {
  return buildApiUrl(APPLICATION.GITHUB_BASE_URL, hostname, '/api/v3/');
}

export function getGitHubAPIBaseUrl(hostname: Hostname, type: APIClientType) {
  const base =
    type === 'rest'
      ? Constants.GITHUB_API_BASE_URL
      : Constants.GITHUB_API_GRAPHQL_URL;
  const enterprisePath = type === 'rest' ? '/api/v3/' : '/api/graphql';
  return buildApiUrl(base, hostname, enterprisePath);
}

function buildApiUrl(
  base: string,
  hostname: Hostname,
  enterprisePath: string,
): URL {
  const url = new URL(base);

  if (isEnterpriseServerHost(hostname)) {
    url.hostname = hostname;
    url.pathname = enterprisePath;
  }

  return url;
}

export function getNumberFromUrl(url: string): number {
  return Number.parseInt(url.split('/').pop(), 10);
}
