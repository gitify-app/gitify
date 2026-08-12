import { Constants } from '../../../constants';

import type { Hostname } from '../../../types';
import type { PlatformType } from '../../auth/types';

/**
 * Resolve the GitHub platform label from the hostname.
 *
 * GitHub varies by hostname (Cloud, Enterprise Server, Enterprise Cloud with
 * Data Residency).
 */
export function getGitHubPlatform(hostname: string): PlatformType {
  if (hostname.endsWith(Constants.GITHUB_HOSTNAME)) {
    return 'GitHub Cloud';
  }

  if (hostname.endsWith(Constants.GITHUB_ENTERPRISE_CLOUD_DATA_RESIDENCY_HOSTNAME)) {
    return 'GitHub Enterprise Cloud with Data Residency';
  }

  return 'GitHub Enterprise Server';
}

export function isGitHubCloudHost(hostname: Hostname): boolean {
  return getGitHubPlatform(hostname) === 'GitHub Cloud';
}

export function isGitHubEnterpriseServerHost(hostname: Hostname): boolean {
  return getGitHubPlatform(hostname) === 'GitHub Enterprise Server';
}

export function isGitHubCloudDataResidencyHost(hostname: Hostname): boolean {
  return getGitHubPlatform(hostname) === 'GitHub Enterprise Cloud with Data Residency';
}
