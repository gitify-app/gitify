import {
  mockGitHubAppAccount,
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';
import { mockToken } from '../../__mocks__/state-mocks';

import * as comms from '../comms';
import { clearOctokitClientCache, createOctokitClient } from './octokit';
import * as utils from './utils';

describe('renderer/utils/api/octokit.ts', () => {
  const mockDecryptValue = jest.spyOn(comms, 'decryptValue');

  beforeEach(() => {
    jest.clearAllMocks();
    mockDecryptValue.mockResolvedValue('decrypted-token');
    clearOctokitClientCache();
  });

  afterEach(() => {
    clearOctokitClientCache();
    jest.clearAllMocks();
  });

  describe('createOctokitClient', () => {
    it('should create octokit client for GitHub Cloud', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://api.github.com/'),
      );

      const octokit = await createOctokitClient(mockGitHubCloudAccount);

      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledWith('github.com');
      expect(octokit).toBeDefined();
      expect(mockDecryptValue).toHaveBeenCalledWith(mockToken);
    });

    it('should create octokit client for GitHub Enterprise Server', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://github.gitify.io/api/v3/'),
      );

      const octokit = await createOctokitClient(
        mockGitHubEnterpriseServerAccount,
      );

      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledWith('github.gitify.io');
      expect(octokit).toBeDefined();
      expect(mockDecryptValue).toHaveBeenCalledWith(mockToken);
    });

    it('should cache and reuse octokit clients for the same account', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://api.github.com/'),
      );

      const octokit1 = await createOctokitClient(mockGitHubCloudAccount);

      const octokit2 = await createOctokitClient(mockGitHubCloudAccount);

      // Should return the same instance
      expect(octokit1).toBe(octokit2);

      // Should only decrypt token once (on first call)
      expect(mockDecryptValue).toHaveBeenCalledTimes(1);

      // Should only get base URL once (on first call)
      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledTimes(1);
    });

    it('should create different clients for different accounts', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://api.github.com/'),
      );

      const octokit1 = await createOctokitClient(mockGitHubAppAccount);

      const octokit2 = await createOctokitClient(mockGitHubCloudAccount);

      // Should be different instances for different tokens
      expect(octokit1).not.toBe(octokit2);

      // Should decrypt both tokens
      expect(mockDecryptValue).toHaveBeenCalledTimes(2);
    });
  });
});
