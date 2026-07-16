import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';

import type { Hostname } from '../../types';

import * as authUtils from './utils';

describe('renderer/utils/auth/utils.ts', () => {
  describe('isValidHostname', () => {
    it('should validate hostname - github cloud', () => {
      expect(authUtils.isValidHostname('github.com' as Hostname)).toBeTruthy();
    });

    it('should validate hostname - github enterprise server', () => {
      expect(authUtils.isValidHostname('github.gitify.io' as Hostname)).toBeTruthy();
    });

    it('should invalidate hostname - empty', () => {
      expect(authUtils.isValidHostname('' as Hostname)).toBeFalsy();
    });

    it('should invalidate hostname - invalid', () => {
      expect(authUtils.isValidHostname('github' as Hostname)).toBeFalsy();
    });
  });

  describe('getAccountUUID', () => {
    it('should validate account uuid', () => {
      expect(authUtils.getAccountUUID(mockGitHubCloudAccount)).toBe(
        'Z2l0aHViLmNvbS0xMjM0NTY3ODktUGVyc29uYWwgQWNjZXNzIFRva2Vu',
      );
    });
  });
});
