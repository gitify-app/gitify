import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../../__mocks__/account-mocks';

import {
  githubCapabilities,
  getGitHubCapabilities,
  supportsAnsweredDiscussion,
  supportsIssueFields,
  supportsStackedPullRequests,
} from './capabilities';

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

  describe('supportsStackedPullRequests', () => {
    it('returns true for GitHub Cloud', () => {
      expect(supportsStackedPullRequests(mockGitHubCloudAccount)).toBe(true);
    });

    it('returns false for GitHub Enterprise Server', () => {
      expect(supportsStackedPullRequests(mockGitHubEnterpriseServerAccount)).toBe(false);
    });

    it('returns false when the GHES version is unknown', () => {
      expect(
        supportsStackedPullRequests({
          ...mockGitHubEnterpriseServerAccount,
          version: undefined,
        }),
      ).toBe(false);
    });
  });

  describe('supportsIssueFields', () => {
    it('returns true for GitHub Cloud', () => {
      expect(supportsIssueFields(mockGitHubCloudAccount)).toBe(true);
    });

    it('returns false for GitHub Enterprise Server < v3.23', () => {
      expect(
        supportsIssueFields({
          ...mockGitHubEnterpriseServerAccount,
          version: '3.22.0',
        }),
      ).toBe(false);
    });

    it('returns true for GitHub Enterprise Server >= v3.23', () => {
      expect(
        supportsIssueFields({
          ...mockGitHubEnterpriseServerAccount,
          version: '3.23.0',
        }),
      ).toBe(true);
    });

    it('returns false when the GHES version is unknown', () => {
      expect(
        supportsIssueFields({
          ...mockGitHubEnterpriseServerAccount,
          version: undefined,
        }),
      ).toBe(false);
    });
  });

  describe('getGitHubCapabilities', () => {
    it('enables all gated capabilities for GitHub Cloud', () => {
      expect(getGitHubCapabilities(mockGitHubCloudAccount)).toEqual({
        stackedPullRequests: true,
        answeredDiscussion: true,
        issueFields: true,
      });
    });

    it('disables gated capabilities for GitHub Enterprise Server', () => {
      expect(getGitHubCapabilities(mockGitHubEnterpriseServerAccount)).toEqual({
        stackedPullRequests: false,
        answeredDiscussion: false,
        issueFields: false,
      });
    });

    it('enables issueFields for GitHub Enterprise Server >= v3.23', () => {
      expect(
        getGitHubCapabilities({
          ...mockGitHubEnterpriseServerAccount,
          version: '3.23.0',
        }),
      ).toEqual({
        stackedPullRequests: false,
        answeredDiscussion: true,
        issueFields: true,
      });
    });
  });
});
