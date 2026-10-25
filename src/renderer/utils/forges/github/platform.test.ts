import type { Hostname } from '../../../types';

import {
  getGitHubPlatform,
  isGitHubCloudDataResidencyHost,
  isGitHubCloudHost,
  isGitHubEnterpriseServerHost,
} from './platform';

describe('renderer/utils/forges/github/platform.ts', () => {
  describe('getGitHubPlatform', () => {
    it('returns GitHub Cloud', () => {
      expect(getGitHubPlatform('github.com')).toBe('GitHub Cloud');
      expect(getGitHubPlatform('api.github.com')).toBe('GitHub Cloud');
    });

    it('returns GitHub Enterprise Server', () => {
      expect(getGitHubPlatform('github.gitify.app')).toBe('GitHub Enterprise Server');
      expect(getGitHubPlatform('api.github.gitify.app')).toBe('GitHub Enterprise Server');
    });

    it('returns GitHub Enterprise Cloud with Data Residency for ghe.com domains', () => {
      expect(getGitHubPlatform('gitify.ghe.com')).toBe(
        'GitHub Enterprise Cloud with Data Residency',
      );
      expect(getGitHubPlatform('acme-corp.ghe.com')).toBe(
        'GitHub Enterprise Cloud with Data Residency',
      );
    });
  });

  describe('isGitHubCloudHost', () => {
    it('returns true for github.com hosts', () => {
      expect(isGitHubCloudHost('github.com' as Hostname)).toBe(true);
      expect(isGitHubCloudHost('api.github.com' as Hostname)).toBe(true);
    });

    it('returns false for non github.com hosts', () => {
      expect(isGitHubCloudHost('github.gitify.app' as Hostname)).toBe(false);
      expect(isGitHubCloudHost('gitify.ghe.com' as Hostname)).toBe(false);
    });
  });

  describe('isGitHubCloudDataResidencyHost', () => {
    it('returns true for ghe.com hosts', () => {
      expect(isGitHubCloudDataResidencyHost('gitify.ghe.com' as Hostname)).toBe(true);
      expect(isGitHubCloudDataResidencyHost('acme-corp.ghe.com' as Hostname)).toBe(true);
    });

    it('returns false for non ghe.com hosts', () => {
      expect(isGitHubCloudDataResidencyHost('github.com' as Hostname)).toBe(false);
      expect(isGitHubCloudDataResidencyHost('api.github.com' as Hostname)).toBe(false);
      expect(isGitHubCloudDataResidencyHost('github.gitify.app' as Hostname)).toBe(false);
    });
  });

  describe('isGitHubEnterpriseServerHost', () => {
    it('returns true for enterprise server host', () => {
      expect(isGitHubEnterpriseServerHost('github.gitify.app' as Hostname)).toBe(true);
      expect(isGitHubEnterpriseServerHost('api.github.gitify.app' as Hostname)).toBe(true);
    });

    it('returns false for github.com host', () => {
      expect(isGitHubEnterpriseServerHost('github.com' as Hostname)).toBe(false);
      expect(isGitHubEnterpriseServerHost('api.github.com' as Hostname)).toBe(false);
    });

    it('returns false for ghe.com host', () => {
      expect(isGitHubEnterpriseServerHost('gitify.ghe.com' as Hostname)).toBe(false);
      expect(isGitHubEnterpriseServerHost('acme-corp.ghe.com' as Hostname)).toBe(false);
    });
  });
});
