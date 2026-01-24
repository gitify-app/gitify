import { Constants } from '../../constants';

import type { Hostname } from '../../types';
import type { APIClientType } from './types';

import { isEnterpriseServerHost } from '../helpers';

export function getGitHubAPIBaseUrl(hostname: Hostname, type: APIClientType) {
  const url = new URL(Constants.GITHUB_API_BASE_URL);

  if (isEnterpriseServerHost(hostname)) {
    url.hostname = hostname;
    url.pathname = type === 'rest' ? '/api/v3/' : '/api/';
  }

  return url;
}

export function getNumberFromUrl(url: string): number {
  return Number.parseInt(url.split('/').pop(), 10);
}
