import {
  mockBitbucketAccount,
  mockGiteaAccount,
  mockGitHubCloudAccount,
  mockGitLabAccount,
} from '../../__mocks__/account-mocks';

import type { Account, Forge, Link } from '../../types';

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

    it('resolves members at call time so later replacements are honoured', () => {
      const view = getAccountAdapter(mockGitHubCloudAccount);
      const urlSpy = vi
        .spyOn(getAdapter('github').accountOps, 'getIssuesUrl')
        .mockReturnValue('https://example.test/issues' as Link);

      expect(view.getIssuesUrl()).toBe('https://example.test/issues');
      expect(urlSpy).toHaveBeenCalledWith(mockGitHubCloudAccount);
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
