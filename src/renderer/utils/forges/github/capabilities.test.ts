import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../../__mocks__/account-mocks';

import { githubCapabilities, supportsAnsweredDiscussion } from './capabilities';

describe('renderer/utils/forges/github/capabilities.ts', () => {
  describe('markAsDone', () => {
    it('returns true for GitHub Cloud', () => {
      expect(githubCapabilities.markAsDone(mockGitHubCloudAccount)).toBe(true);
    });

    it('returns false for GitHub Enterprise Server < v3.13', () => {
      expect(
        githubCapabilities.markAsDone({
          ...mockGitHubEnterpriseServerAccount,
          version: '3.12.0',
        }),
      ).toBe(false);
    });

    it('returns true for GitHub Enterprise Server >= v3.13', () => {
      expect(
        githubCapabilities.markAsDone({
          ...mockGitHubEnterpriseServerAccount,
          version: '3.13.0',
        }),
      ).toBe(true);
    });

    it('returns false when the GHES version is unknown', () => {
      expect(
        githubCapabilities.markAsDone({
          ...mockGitHubEnterpriseServerAccount,
          version: undefined,
        }),
      ).toBe(false);
    });
  });

  describe('supportsAnsweredDiscussion', () => {
    it('returns true for GitHub Cloud', () => {
      expect(supportsAnsweredDiscussion(mockGitHubCloudAccount)).toBe(true);
    });

    it('returns false for GitHub Enterprise Server < v3.12', () => {
      expect(
        supportsAnsweredDiscussion({
          ...mockGitHubEnterpriseServerAccount,
          version: '3.11.0',
        }),
      ).toBe(false);
    });

    it('returns true for GitHub Enterprise Server >= v3.12', () => {
      expect(
        supportsAnsweredDiscussion({
          ...mockGitHubEnterpriseServerAccount,
          version: '3.12.0',
        }),
      ).toBe(true);
    });

    it('returns false when the GHES version is unknown', () => {
      expect(
        supportsAnsweredDiscussion({
          ...mockGitHubEnterpriseServerAccount,
          version: undefined,
        }),
      ).toBe(false);
    });
  });
});
