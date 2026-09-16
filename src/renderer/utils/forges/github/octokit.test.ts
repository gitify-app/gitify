import {
  mockGitHubAppAccount,
  mockGitHubCliAccount,
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../../__mocks__/account-mocks';

import type { Token } from '../../../types';

import * as comms from '../../system/comms';
import * as cli from './cli';
import {
  clearOctokitClientCache,
  createOctokitClient,
  createOctokitClientUncached,
} from './octokit';
import * as utils from './utils';

describe('renderer/utils/forges/github/octokit.ts', () => {
  const mockDecryptValue = vi.spyOn(comms, 'decryptValue');

  beforeEach(() => {
    mockDecryptValue.mockResolvedValue({ token: 'decrypted-token' });
    clearOctokitClientCache();
  });

  afterEach(() => {
    clearOctokitClientCache();
  });

  describe('createOctokitClient', () => {
    it('should create octokit rest client for GitHub Cloud', async () => {
      const getGitHubAPIBaseUrlSpy = vi.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(new URL('https://api.github.com/'));

      const octokit = await createOctokitClient(mockGitHubCloudAccount, 'rest');

      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledWith('github.com', 'rest');
      expect(octokit).toBeDefined();
      expect(mockDecryptValue).toHaveBeenCalledWith(mockGitHubCloudAccount.token);
    });

    it('should create octokit graphql client for GitHub Cloud', async () => {
      const getGitHubAPIBaseUrlSpy = vi.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(new URL('https://api.github.com/'));

      const octokit = await createOctokitClient(mockGitHubCloudAccount, 'graphql');

      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledWith('github.com', 'graphql');
      expect(octokit).toBeDefined();
      expect(mockDecryptValue).toHaveBeenCalledWith(mockGitHubCloudAccount.token);
    });

    it('should create octokit rest client for GitHub Enterprise Server', async () => {
      const getGitHubAPIBaseUrlSpy = vi.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(new URL('https://github.gitify.io/api/v3/'));

      const octokit = await createOctokitClient(mockGitHubEnterpriseServerAccount, 'rest');

      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledWith('github.gitify.io', 'rest');
      expect(octokit).toBeDefined();
      expect(mockDecryptValue).toHaveBeenCalledWith(mockGitHubEnterpriseServerAccount.token);
    });

    it('should create octokit graphql client for GitHub Enterprise Server', async () => {
      const getGitHubAPIBaseUrlSpy = vi.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(new URL('https://github.gitify.io/api/graphql/'));

      const octokit = await createOctokitClient(mockGitHubEnterpriseServerAccount, 'graphql');

      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledWith('github.gitify.io', 'graphql');
      expect(octokit).toBeDefined();
      expect(mockDecryptValue).toHaveBeenCalledWith(mockGitHubEnterpriseServerAccount.token);
    });

    it('should cache and reuse octokit clients for the same account and api type', async () => {
      const getGitHubAPIBaseUrlSpy = vi.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(new URL('https://api.github.com/'));

      const octokit1 = await createOctokitClient(mockGitHubCloudAccount, 'rest');

      const octokit2 = await createOctokitClient(mockGitHubCloudAccount, 'rest');

      // Should return the same instance
      expect(octokit1).toBe(octokit2);

      // Should only decrypt token once (on first call)
      expect(mockDecryptValue).toHaveBeenCalledTimes(1);

      // Should only get base URL once (on first call)
      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledTimes(1);
    });

    it('should create separate uncached clients each time', async () => {
      const getGitHubAPIBaseUrlSpy = vi.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(new URL('https://api.github.com/'));

      const client1 = await createOctokitClientUncached(mockGitHubCloudAccount, 'rest');

      const client2 = await createOctokitClientUncached(mockGitHubCloudAccount, 'rest');

      // Should create different instances each time
      expect(client1).not.toBe(client2);

      // Should decrypt token each time
      expect(mockDecryptValue).toHaveBeenCalledTimes(2);

      // Should get base URL each time
      expect(getGitHubAPIBaseUrlSpy).toHaveBeenCalledTimes(2);
    });

    it('should create different clients for different accounts with same api type', async () => {
      const getGitHubAPIBaseUrlSpy = vi.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(new URL('https://api.github.com/'));

      const octokit1 = await createOctokitClient(mockGitHubAppAccount, 'rest');

      const octokit2 = await createOctokitClient(mockGitHubCloudAccount, 'rest');

      // Should be different instances for different tokens
      expect(octokit1).not.toBe(octokit2);

      // Should decrypt both tokens
      expect(mockDecryptValue).toHaveBeenCalledTimes(2);
    });

    it('should create different clients for same accounts with different api type', async () => {
      const getGitHubAPIBaseUrlSpy = vi.spyOn(utils, 'getGitHubAPIBaseUrl');
      getGitHubAPIBaseUrlSpy.mockReturnValue(new URL('https://api.github.com/'));

      const octokit1 = await createOctokitClient(mockGitHubCloudAccount, 'rest');

      const octokit2 = await createOctokitClient(mockGitHubCloudAccount, 'graphql');

      // Should be different instances for different tokens
      expect(octokit1).not.toBe(octokit2);

      // Should decrypt both tokens
      expect(mockDecryptValue).toHaveBeenCalledTimes(2);
    });
  });

  describe('GitHub CLI accounts', () => {
    function stubFetch(statuses: number[]) {
      const authorizations: string[] = [];

      const fetchMock = vi.fn(
        async (_url: string, options: { headers: Record<string, string> }) => {
          authorizations.push(options.headers.authorization);
          const status = statuses.shift() ?? 200;

          return new Response(
            status === 200 ? '{"login":"octocat"}' : '{"message":"Bad credentials"}',
            {
              status,
              headers: { 'content-type': 'application/json' },
            },
          );
        },
      );

      vi.stubGlobal('fetch', fetchMock);

      return { authorizations, fetchMock };
    }

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('authenticates each request from the CLI rather than the stored token', async () => {
      const resolveSpy = vi
        .spyOn(cli, 'resolveGitHubCliToken')
        .mockResolvedValue('gho_live' as Token);
      const { authorizations } = stubFetch([200]);

      const octokit = await createOctokitClientUncached(mockGitHubCliAccount, 'rest');
      await octokit.request('GET /user');

      expect(authorizations).toEqual(['token gho_live']);
      expect(resolveSpy).toHaveBeenCalledWith(mockGitHubCliAccount.hostname);
      expect(mockDecryptValue).not.toHaveBeenCalled();
    });

    it('retries a rejected request against a re-read CLI credential', async () => {
      const tokens = ['gho_stale', 'gho_rotated'];
      vi.spyOn(cli, 'resolveGitHubCliToken').mockImplementation(
        async () => tokens.shift() as Token,
      );
      const forgetSpy = vi.spyOn(cli, 'forgetGitHubCliToken');
      const { authorizations } = stubFetch([401, 200]);

      const octokit = await createOctokitClientUncached(mockGitHubCliAccount, 'rest');
      const response = await octokit.request('GET /user');

      expect(response.status).toBe(200);
      expect(authorizations).toEqual(['token gho_stale', 'token gho_rotated']);
      // Without this the memo would keep serving the stale token.
      expect(forgetSpy).toHaveBeenCalledWith(mockGitHubCliAccount.hostname);
    });

    it('gives up when the re-read credential is rejected too', async () => {
      vi.spyOn(cli, 'resolveGitHubCliToken').mockResolvedValue('gho_stale' as Token);
      const { fetchMock } = stubFetch([401, 401]);

      const octokit = await createOctokitClientUncached(mockGitHubCliAccount, 'rest');

      await expect(octokit.request('GET /user')).rejects.toThrow('Bad credentials');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
