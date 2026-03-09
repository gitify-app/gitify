import type { Hostname } from '../../types';

import {
  getPlatformFromHostname,
  isCloudDataResidencyHost,
  isEnterpriseServerHost,
} from './platform';

describe('renderer/utils/auth/platform.ts', () => {
  describe('getPlatformFromHostname', () => {
    it('should return GitHub Cloud', () => {
      expect(getPlatformFromHostname('github.com' as Hostname)).toBe(
        'GitHub Cloud',
      );
      expect(getPlatformFromHostname('api.github.com' as Hostname)).toBe(
        'GitHub Cloud',
      );
    });

    it('should return GitHub Enterprise Server', () => {
      expect(getPlatformFromHostname('github.gitify.app' as Hostname)).toBe(
        'GitHub Enterprise Server',
      );
      expect(getPlatformFromHostname('api.github.gitify.app' as Hostname)).toBe(
        'GitHub Enterprise Server',
      );
    });

    it('should return GitHub Enterprise Cloud with Data Residency for ghe.com domains', () => {
      expect(getPlatformFromHostname('gitify.ghe.com' as Hostname)).toBe(
        'GitHub Enterprise Cloud with Data Residency',
      );
      expect(getPlatformFromHostname('acme-corp.ghe.com' as Hostname)).toBe(
        'GitHub Enterprise Cloud with Data Residency',
      );
    });
  });

  describe('isCloudDataResidencyHost', () => {
    it('should return true for ghe.com hosts', () => {
      expect(isCloudDataResidencyHost('gitify.ghe.com' as Hostname)).toBe(true);
      expect(isCloudDataResidencyHost('acme-corp.ghe.com' as Hostname)).toBe(
        true,
      );
    });

    it('should return false for non ghe.com hosts', () => {
      expect(isCloudDataResidencyHost('github.com' as Hostname)).toBe(false);
      expect(isCloudDataResidencyHost('api.github.com' as Hostname)).toBe(
        false,
      );
      expect(isCloudDataResidencyHost('github.gitify.app' as Hostname)).toBe(
        false,
      );
    });
  });

  describe('isEnterpriseServerHost', () => {
    it('should return true for enterprise server host', () => {
      expect(isEnterpriseServerHost('github.gitify.app' as Hostname)).toBe(
        true,
      );
      expect(isEnterpriseServerHost('api.github.gitify.app' as Hostname)).toBe(
        true,
      );
    });

    it('should return false for github.com host', () => {
      expect(isEnterpriseServerHost('github.com' as Hostname)).toBe(false);
      expect(isEnterpriseServerHost('api.github.com' as Hostname)).toBe(false);
    });

    it('should return false for ghe.com host', () => {
      expect(isEnterpriseServerHost('gitify.ghe.com' as Hostname)).toBe(false);
      expect(isEnterpriseServerHost('acme-corp.ghe.com' as Hostname)).toBe(
        false,
      );
    });
  });
});
