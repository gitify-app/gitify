import {
  mockGiteaAccount,
  mockGitHubCloudAccount,
} from '../../__mocks__/account-mocks';

import type { Account, Forge } from '../../types';

import { getAdapter, getAdapterById, listAdapters } from './registry';

describe('renderer/utils/forges/registry.ts', () => {
  describe('getAdapter', () => {
    it('returns the GitHub adapter for github accounts', () => {
      expect(getAdapter(mockGitHubCloudAccount).id).toBe('github');
    });

    it('returns the Gitea adapter for gitea accounts', () => {
      expect(getAdapter(mockGiteaAccount).id).toBe('gitea');
    });

    it('throws for an unknown forge', () => {
      const unknown = {
        ...mockGitHubCloudAccount,
        forge: 'mystery' as Forge,
      } as Account;
      expect(() => getAdapter(unknown)).toThrow(/No forge adapter registered/);
    });
  });

  describe('getAdapterById', () => {
    it('returns the registered adapter by id', () => {
      expect(getAdapterById('github').id).toBe('github');
      expect(getAdapterById('gitea').id).toBe('gitea');
    });

    it('throws for an unknown id', () => {
      expect(() => getAdapterById('mystery' as Forge)).toThrow(
        /No forge adapter registered/,
      );
    });
  });

  describe('listAdapters', () => {
    it('returns every registered adapter', () => {
      const ids = listAdapters().map((a) => a.id);
      expect(ids).toEqual(expect.arrayContaining(['github', 'gitea']));
    });
  });
});
