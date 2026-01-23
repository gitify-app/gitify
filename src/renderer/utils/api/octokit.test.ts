import {
  mockGitHubAppAccount,
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';

import * as comms from '../comms';
import {
  clearOctokitClientCache,
  createOctokitClient,
  createOctokitClientUncached,
} from './octokit';
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
    it('should create octokit rest client for GitHub Cloud', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://api.github.com/'),
      );

      const octokit = await createOctokitClient(mockGitHubCloudAccount, 'rest');

      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledWith('github.com', 'rest');
      expect(octokit).toBeDefined();
      expect(mockDecryptValue).toHaveBeenCalledWith(
        mockGitHubCloudAccount.token,
      );
    });

    it('should create octokit graphql client for GitHub Cloud', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://api.github.com/'),
      );

      const octokit = await createOctokitClient(
        mockGitHubCloudAccount,
        'graphql',
      );

      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledWith(
        'github.com',
        'graphql',
      );
      expect(octokit).toBeDefined();
      expect(mockDecryptValue).toHaveBeenCalledWith(
        mockGitHubCloudAccount.token,
      );
    });

    it('should create octokit rest client for GitHub Enterprise Server', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://github.gitify.io/api/v3/'),
      );

      const octokit = await createOctokitClient(
        mockGitHubEnterpriseServerAccount,
        'rest',
      );

      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledWith(
        'github.gitify.io',
        'rest',
      );
      expect(octokit).toBeDefined();
      expect(mockDecryptValue).toHaveBeenCalledWith(
        mockGitHubEnterpriseServerAccount.token,
      );
    });

    it('should create octokit graphql client for GitHub Enterprise Server', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://github.gitify.io/api/graphql/'),
      );

      const octokit = await createOctokitClient(
        mockGitHubEnterpriseServerAccount,
        'graphql',
      );

      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledWith(
        'github.gitify.io',
        'graphql',
      );
      expect(octokit).toBeDefined();
      expect(mockDecryptValue).toHaveBeenCalledWith(
        mockGitHubEnterpriseServerAccount.token,
      );
    });

    it('should cache and reuse octokit clients for the same account and api type', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://api.github.com/'),
      );

      const octokit1 = await createOctokitClient(
        mockGitHubCloudAccount,
        'rest',
      );

      const octokit2 = await createOctokitClient(
        mockGitHubCloudAccount,
        'rest',
      );

      // Should return the same instance
      expect(octokit1).toBe(octokit2);

      // Should only decrypt token once (on first call)
      expect(mockDecryptValue).toHaveBeenCalledTimes(1);

      // Should only get base URL once (on first call)
      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledTimes(1);
    });

    it('should create separate uncached clients each time', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://api.github.com/'),
      );

      const client1 = await createOctokitClientUncached(
        mockGitHubCloudAccount,
        'rest',
      );

      const client2 = await createOctokitClientUncached(
        mockGitHubCloudAccount,
        'rest',
      );

      // Should create different instances each time
      expect(client1).not.toBe(client2);

      // Should decrypt token each time
      expect(mockDecryptValue).toHaveBeenCalledTimes(2);

      // Should get base URL each time
      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledTimes(2);
    });

    it('should create different clients for different accounts with same api type', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://api.github.com/'),
      );

      const octokit1 = await createOctokitClient(mockGitHubAppAccount, 'rest');

      const octokit2 = await createOctokitClient(
        mockGitHubCloudAccount,
        'rest',
      );

      // Should be different instances for different tokens
      expect(octokit1).not.toBe(octokit2);

      // Should decrypt both tokens
      expect(mockDecryptValue).toHaveBeenCalledTimes(2);
    });

    it('should create different clients for same accounts with different api type', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://api.github.com/'),
      );

      const octokit1 = await createOctokitClient(
        mockGitHubCloudAccount,
        'rest',
      );

      const octokit2 = await createOctokitClient(
        mockGitHubCloudAccount,
        'graphql',
      );

      // Should be different instances for different tokens
      expect(octokit1).not.toBe(octokit2);

      // Should decrypt both tokens
      expect(mockDecryptValue).toHaveBeenCalledTimes(2);
    });
  });
});
