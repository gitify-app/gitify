import { Constants } from '../../constants';

import type { Hostname } from '../../types';
import type { APIClientType } from './types';

import { getPlatformFromHostname } from '../helpers';

export function getGitHubAPIBaseUrl(hostname: Hostname, type: APIClientType) {
  const platform = getPlatformFromHostname(hostname);
  const url = new URL(Constants.GITHUB_API_BASE_URL);

  switch (platform) {
    case 'GitHub Enterprise Server':
      url.hostname = hostname;
      url.pathname = type === 'rest' ? '/api/v3/' : '/api/';
      break;
    case 'GitHub Enterprise Cloud with Data Residency':
      url.hostname = `api.${hostname}`;
      url.pathname = '/';
      break;
    default:
      url.pathname = '/';
      break;
  }

  return url;
}

export function getNumberFromUrl(url: string): number {
  return Number.parseInt(url.split('/').pop(), 10);
}
