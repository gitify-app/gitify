import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';
import {
  isAnsweredDiscussionFeatureSupported,
  isMarkAsDoneFeatureSupported,
} from './features';

describe('renderer/utils/features.ts', () => {
  describe('isMarkAsDoneFeatureSupported', () => {
    it('should return true for GitHub Cloud', () => {
      expect(isMarkAsDoneFeatureSupported(mockGitHubCloudAccount)).toBe(true);
    });

    it('should return false for GitHub Enterprise Server < v3.13', () => {
      const account = {
        ...mockGitHubEnterpriseServerAccount,
        version: '3.12.0',
      };

      expect(isMarkAsDoneFeatureSupported(account)).toBe(false);
    });

    it('should return true for GitHub Enterprise Server >= v3.13', () => {
      const account = {
        ...mockGitHubEnterpriseServerAccount,
        version: '3.13.0',
      };

      expect(isMarkAsDoneFeatureSupported(account)).toBe(true);
    });

    it('should return false for GitHub Enterprise Server when no version available', () => {
      const account = {
        ...mockGitHubEnterpriseServerAccount,
        version: null,
      };

      expect(isMarkAsDoneFeatureSupported(account)).toBe(false);
    });
  });

  describe('isAnsweredDiscussionFeatureSupported', () => {
    it('should return true for GitHub Cloud', () => {
      expect(isAnsweredDiscussionFeatureSupported(mockGitHubCloudAccount)).toBe(
        true,
      );
    });

    it('should return false for GitHub Enterprise Server < v3.12', () => {
      const account = {
        ...mockGitHubEnterpriseServerAccount,
        version: '3.11.0',
      };

      expect(isAnsweredDiscussionFeatureSupported(account)).toBe(false);
    });

    it('should return true for GitHub Enterprise Server >= v3.12', () => {
      const account = {
        ...mockGitHubEnterpriseServerAccount,
        version: '3.12.0',
      };

      expect(isAnsweredDiscussionFeatureSupported(account)).toBe(true);
    });

    it('should return false for GitHub Enterprise Server when no version available', () => {
      const account = {
        ...mockGitHubEnterpriseServerAccount,
        version: null,
      };

      expect(isAnsweredDiscussionFeatureSupported(account)).toBe(false);
    });
  });
});
