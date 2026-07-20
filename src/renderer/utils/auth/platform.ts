import { Constants } from '../../constants';

import type { Forge, Hostname } from '../../types';
import type { PlatformType } from './types';

/**
 * Resolve the UI platform label from forge + hostname.
 *
 * Gitea always reports as 'Gitea'; GitHub varies by hostname (Cloud, Enterprise
 * Server, Enterprise Cloud with Data Residency).
 */
export function resolvePlatform(forge: Forge, hostname: Hostname): PlatformType {
  if (forge === 'bitbucket') {
    return 'Bitbucket Cloud';
  }
  if (forge === 'gitea') {
    return 'Gitea';
  }
  return getPlatformFromHostname(hostname);
}

export function getPlatformFromHostname(hostname: string): PlatformType {
  if (hostname.endsWith(Constants.GITHUB_HOSTNAME)) {
    return 'GitHub Cloud';
  }

  if (hostname.endsWith(Constants.GITHUB_ENTERPRISE_CLOUD_DATA_RESIDENCY_HOSTNAME)) {
    return 'GitHub Enterprise Cloud with Data Residency';
  }

  return 'GitHub Enterprise Server';
}

export function isEnterpriseServerHost(hostname: Hostname): boolean {
  return getPlatformFromHostname(hostname) === 'GitHub Enterprise Server';
}

export function isCloudDataResidencyHost(hostname: Hostname): boolean {
  return getPlatformFromHostname(hostname) === 'GitHub Enterprise Cloud with Data Residency';
}
