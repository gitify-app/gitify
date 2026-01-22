import { mockToken } from '../../__mocks__/state-mocks';

import type { Hostname } from '../../types';

import * as comms from '../comms';
import { createOctokitClient } from './octokit';
import * as utils from './utils';

describe('renderer/utils/api/octokit.ts', () => {
  const mockDecryptValue = jest.spyOn(comms, 'decryptValue');

  beforeEach(() => {
    mockDecryptValue.mockResolvedValue('decrypted-token');
  });

  describe('createOctokitClient', () => {
    it('should create octokit client for GitHub Cloud', async () => {
      const getGitHubAPIBaseUrlSpy = jest.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(
        new URL('https://api.github.com/'),
      );

      const octokit = await createOctokitClient(
        'github.com' as Hostname,
        mockToken,
      );

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
        'github.gitify.io' as Hostname,
        mockToken,
      );

      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledWith('github.gitify.io');
      expect(octokit).toBeDefined();
      expect(mockDecryptValue).toHaveBeenCalledWith(mockToken);
    });
  });
});
