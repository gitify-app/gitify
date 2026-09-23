import { expectTypeOf } from 'vite-plus/test';

import {
  mockBitbucketAccount,
  mockGiteaAccount,
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
  mockGitLabAccount,
} from '../../__mocks__/account-mocks';

import type { Account, Forge, Link } from '../../types';
import type { ForgeAccountAdapter, ForgeAccountOperations } from './types';

import * as giteaClient from './gitea/client';
import {
  getAccountAdapter,
  getAdapter,
  isKnownForge,
  KNOWN_FORGES,
  listAdapters,
} from './registry';

describe('renderer/utils/forges/registry.ts', () => {
  describe('getAdapter', () => {
    it('returns the GitHub adapter for github accounts', () => {
      expect(getAdapter(mockGitHubCloudAccount).id).toBe('github');
    });

    it('returns the Gitea adapter for gitea accounts', () => {
      expect(getAdapter(mockGiteaAccount).id).toBe('gitea');
    });

    it('returns the Bitbucket adapter for bitbucket accounts', () => {
      expect(getAdapter(mockBitbucketAccount).id).toBe('bitbucket');
    });

    it('returns the GitLab adapter for gitlab accounts', () => {
      expect(getAdapter(mockGitLabAccount).id).toBe('gitlab');
    });

    it('returns the registered adapter by forge id', () => {
      expect(getAdapter('github').id).toBe('github');
      expect(getAdapter('gitea').id).toBe('gitea');
      expect(getAdapter('bitbucket').id).toBe('bitbucket');
      expect(getAdapter('gitlab').id).toBe('gitlab');
    });

    it('throws for an unknown forge on an account', () => {
      const unknown = {
        ...mockGitHubCloudAccount,
        forge: 'mystery' as Forge,
      } as Account;
      expect(() => getAdapter(unknown)).toThrow(/No forge adapter registered/);
    });

    it('throws for an unknown forge id', () => {
      expect(() => getAdapter('mystery' as Forge)).toThrow(/No forge adapter registered/);
    });
  });

  describe('getAccountAdapter', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('supplies the account to account-scoped operations', async () => {
      const listSpy = vi
        .spyOn(getAdapter('github').accountOps, 'listNotifications')
        .mockResolvedValue([]);

      await getAccountAdapter(mockGitHubCloudAccount).listNotifications();

      expect(listSpy).toHaveBeenCalledWith(mockGitHubCloudAccount);
    });

    it('passes remaining arguments after the account', async () => {
      const markSpy = vi
        .spyOn(getAdapter('github').accountOps, 'markThreadAsRead')
        .mockResolvedValue(undefined);

      await getAccountAdapter(mockGitHubCloudAccount).markThreadAsRead('thread-1');

      expect(markSpy).toHaveBeenCalledWith(mockGitHubCloudAccount, 'thread-1');
    });

    it('binds nested bundles such as capabilities', () => {
      const capabilitySpy = vi
        .spyOn(getAdapter('github').accountOps.capabilities, 'markAsDone')
        .mockReturnValue(true);

      expect(getAccountAdapter(mockGitHubCloudAccount).capabilities.markAsDone()).toBe(true);
      expect(capabilitySpy).toHaveBeenCalledWith(mockGitHubCloudAccount);
    });

    it('omits optional bundles the forge does not provide', () => {
      expect(getAccountAdapter(mockGiteaAccount).oauthScopes).toBeUndefined();
      expect(getAccountAdapter(mockGiteaAccount).onAccountTokenChange).toBeUndefined();
      expect(getAccountAdapter(mockGitHubCloudAccount).oauthScopes).toBeDefined();
    });

    it('keeps interleaved operations isolated between accounts on the same forge', async () => {
      const markSpy = vi
        .spyOn(getAdapter('github').accountOps, 'markThreadAsRead')
        .mockResolvedValue(undefined);
      const cloud = getAccountAdapter(mockGitHubCloudAccount);
      const enterprise = getAccountAdapter(mockGitHubEnterpriseServerAccount);

      await cloud.markThreadAsRead('cloud-1');
      await enterprise.markThreadAsRead('enterprise-1');
      await cloud.markThreadAsRead('cloud-2');

      expect(markSpy.mock.calls).toEqual([
        [mockGitHubCloudAccount, 'cloud-1'],
        [mockGitHubEnterpriseServerAccount, 'enterprise-1'],
        [mockGitHubCloudAccount, 'cloud-2'],
      ]);
      expect(cloud.getIssuesUrl()).toBe('https://github.com/issues');
      expect(enterprise.getIssuesUrl()).toBe('https://github.gitify.io/issues');
    });

    it('routes bound Gitea requests through its provider and preserves the response', async () => {
      const url = 'https://gitea.example.com/api/v1/repos/owner/repo/issues/1' as Link;
      const response = { html_url: 'https://gitea.example.com/owner/repo/issues/1' };
      const getJsonSpy = vi.spyOn(giteaClient, 'giteaGetJson').mockResolvedValue(response);
      const markSpy = vi
        .spyOn(giteaClient, 'patchGiteaNotificationThread')
        .mockResolvedValue(undefined);
      const view = getAccountAdapter(mockGiteaAccount);

      const result = await view.followUrl<{ html_url: string }>(url);
      await view.markThreadAsRead('gitea-1');

      expect(result).toBe(response);
      expect(getJsonSpy).toHaveBeenCalledWith(mockGiteaAccount, url);
      expect(markSpy).toHaveBeenCalledWith(mockGiteaAccount, 'gitea-1', 'read');
      expect(view.capabilities.markAsDone()).toBe(false);
      expect(view.getNotificationsUrl()).toBe('https://gitea.example.com/notifications');
    });

    it('propagates a bound provider request failure', async () => {
      const error = new Error('Gitea request failed');
      vi.spyOn(giteaClient, 'giteaGetJson').mockRejectedValue(error);

      await expect(
        getAccountAdapter(mockGiteaAccount).followUrl(
          'https://gitea.example.com/api/v1/user' as Link,
        ),
      ).rejects.toBe(error);
    });

    it('preserves generic response types on both operation contracts', () => {
      expectTypeOf<ForgeAccountOperations['followUrl']>().toEqualTypeOf<
        <T>(account: Account, url: Link) => Promise<T>
      >();
      expectTypeOf<ForgeAccountAdapter['followUrl']>().toEqualTypeOf<
        <T>(url: Link) => Promise<T>
      >();
    });

    it('throws for an unknown forge', () => {
      const unknown = { ...mockGitHubCloudAccount, forge: 'mystery' as Forge } as Account;
      expect(() => getAccountAdapter(unknown)).toThrow(/No forge adapter registered/);
    });
  });

  describe('isKnownForge', () => {
    it('accepts every value in the Forge union', () => {
      expect(isKnownForge('github')).toBe(true);
      expect(isKnownForge('gitea')).toBe(true);
      expect(isKnownForge('bitbucket')).toBe(true);
      expect(isKnownForge('gitlab')).toBe(true);
    });

    it('rejects nullish, casing mismatch, empty, and stranger values', () => {
      expect(isKnownForge(undefined)).toBe(false);
      expect(isKnownForge(null)).toBe(false);
      expect(isKnownForge('')).toBe(false);
      expect(isKnownForge('GitHub')).toBe(false);
      expect(isKnownForge(42)).toBe(false);
      expect(isKnownForge({})).toBe(false);
    });
  });

  describe('listAdapters / KNOWN_FORGES', () => {
    it('returns every registered adapter', () => {
      const ids = listAdapters().map((a) => a.id);
      expect(ids).toEqual(expect.arrayContaining(['github', 'gitea', 'bitbucket', 'gitlab']));
    });

    it('every Forge value has a registered adapter (exhaustive)', () => {
      const forges: Forge[] = ['github', 'gitea', 'bitbucket', 'gitlab'];
      for (const id of forges) {
        expect(KNOWN_FORGES.has(id)).toBe(true);
        expect(() => getAdapter(id)).not.toThrow();
      }
    });
  });
});
