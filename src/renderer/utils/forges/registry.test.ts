import {
  mockBitbucketAccount,
  mockGiteaAccount,
  mockGitHubCloudAccount,
} from '../../__mocks__/account-mocks';

import type { Account, Forge } from '../../types';

import { getAdapter, isKnownForge, KNOWN_FORGES, listAdapters } from './registry';

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

    it('returns the registered adapter by forge id', () => {
      expect(getAdapter('github').id).toBe('github');
      expect(getAdapter('gitea').id).toBe('gitea');
      expect(getAdapter('bitbucket').id).toBe('bitbucket');
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

  describe('isKnownForge', () => {
    it('accepts every value in the Forge union', () => {
      expect(isKnownForge('github')).toBe(true);
      expect(isKnownForge('gitea')).toBe(true);
      expect(isKnownForge('bitbucket')).toBe(true);
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
      expect(ids).toEqual(expect.arrayContaining(['github', 'gitea', 'bitbucket']));
    });

    it('every Forge value has a registered adapter (exhaustive)', () => {
      const forges: Forge[] = ['github', 'gitea', 'bitbucket'];
      for (const id of forges) {
        expect(KNOWN_FORGES.has(id)).toBe(true);
        expect(() => getAdapter(id)).not.toThrow();
      }
    });
  });
});
