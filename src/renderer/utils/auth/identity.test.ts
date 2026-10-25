import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';

import type { Hostname } from '../../types';

import { getAccountUUID, isValidHostname } from './identity';

describe('renderer/utils/auth/identity.ts', () => {
  describe('isValidHostname', () => {
    it('validates hostname - github cloud', () => {
      expect(isValidHostname('github.com' as Hostname)).toBeTruthy();
    });

    it('validates hostname - github enterprise server', () => {
      expect(isValidHostname('github.gitify.io' as Hostname)).toBeTruthy();
    });

    it('invalidates hostname - empty', () => {
      expect(isValidHostname('' as Hostname)).toBeFalsy();
    });

    it('invalidates hostname - invalid', () => {
      expect(isValidHostname('github' as Hostname)).toBeFalsy();
    });
  });

  describe('getAccountUUID', () => {
    it('validates account uuid', () => {
      expect(getAccountUUID(mockGitHubCloudAccount)).toBe(
        'Z2l0aHViLmNvbS0xMjM0NTY3ODktUGVyc29uYWwgQWNjZXNzIFRva2Vu',
      );
    });
  });
});
