import { Constants } from '../../constants';
import type { Hostname } from '../../types';
import type { PlatformType } from './types';

export function getPlatformFromHostname(hostname: string): PlatformType {
  if (hostname.endsWith(Constants.GITHUB_HOSTNAME)) {
    return 'GitHub Cloud';
  }

  if (
    hostname.endsWith(Constants.GITHUB_ENTERPRISE_CLOUD_DATA_RESIDENCY_HOSTNAME)
  ) {
    return 'GitHub Enterprise Cloud with Data Residency';
  }

  return 'GitHub Enterprise Server';
}

export function isEnterpriseServerHost(hostname: Hostname): boolean {
  return getPlatformFromHostname(hostname) === 'GitHub Enterprise Server';
}

export function isCloudDataResidencyHost(hostname: Hostname): boolean {
  return (
    getPlatformFromHostname(hostname) ===
    'GitHub Enterprise Cloud with Data Residency'
  );
}
