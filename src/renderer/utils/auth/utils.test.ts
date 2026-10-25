import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';

import type { Hostname } from '../../types';

import * as authUtils from './utils';

describe('renderer/utils/auth/utils.ts', () => {
  describe('isValidHostname', () => {
    it('validates hostname - github cloud', () => {
      expect(authUtils.isValidHostname('github.com' as Hostname)).toBeTruthy();
    });

    it('validates hostname - github enterprise server', () => {
      expect(authUtils.isValidHostname('github.gitify.io' as Hostname)).toBeTruthy();
    });

    it('invalidates hostname - empty', () => {
      expect(authUtils.isValidHostname('' as Hostname)).toBeFalsy();
    });

    it('invalidates hostname - invalid', () => {
      expect(authUtils.isValidHostname('github' as Hostname)).toBeFalsy();
    });
  });

  describe('getAccountUUID', () => {
    it('validates account uuid', () => {
      expect(authUtils.getAccountUUID(mockGitHubCloudAccount)).toBe(
        'Z2l0aHViLmNvbS0xMjM0NTY3ODktUGVyc29uYWwgQWNjZXNzIFRva2Vu',
      );
    });
  });
});
