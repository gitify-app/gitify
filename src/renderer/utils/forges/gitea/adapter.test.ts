import { KeyIcon } from '@primer/octicons-react';

import { mockGiteaAccount } from '../../../__mocks__/account-mocks';

import type { Hostname, Link, SettingsState, Token } from '../../../types';

import { giteaAdapter } from './adapter';
import * as client from './client';

describe('renderer/utils/forges/gitea/adapter.ts', () => {
  describe('static fields', () => {
    it('identifies as gitea', () => {
      expect(giteaAdapter.id).toBe('gitea');
      expect(giteaAdapter.displayName).toBe('Gitea');
    });

    it('reports unsupported capabilities', () => {
      expect(giteaAdapter.capabilities.markAsDone(mockGiteaAccount)).toBe(false);
      expect(giteaAdapter.capabilities.unsubscribeThread(mockGiteaAccount)).toBe(false);
    });

    it('does not implement detailed enrichment', () => {
      expect(giteaAdapter.enrichNotifications).toBeUndefined();
    });

    it('exposes a single PAT login method', () => {
      expect(giteaAdapter.loginMethods).toHaveLength(1);
      expect(giteaAdapter.loginMethods[0]).toMatchObject({
        testId: 'login-gitea-pat',
        route: '/login-personal-access-token',
        state: { forge: 'gitea' },
      });
    });

    it('builds PAT settings and account settings URLs from the hostname', () => {
      expect(giteaAdapter.getPersonalAccessTokenSettingsUrl('gitea.example.com' as Hostname)).toBe(
        'https://gitea.example.com/user/settings/applications',
      );

      expect(giteaAdapter.getAccountSettingsUrl(mockGiteaAccount)).toBe(
        'https://gitea.example.com/user/settings/applications',
      );
    });

    it('returns the key icon for every auth method (PAT-only forge today)', () => {
      expect(giteaAdapter.getAuthMethodIcon('Personal Access Token')).toBe(KeyIcon);
      expect(giteaAdapter.getAuthMethodIcon('GitHub App')).toBe(KeyIcon);
      expect(giteaAdapter.getAuthMethodIcon('OAuth App')).toBe(KeyIcon);
    });
  });

  describe('validateToken', () => {
    it('rejects tokens shorter than 40 characters', () => {
      expect(giteaAdapter.validateToken('a1b2c3d4' as Token)).toBe(false);
    });

    it('rejects tokens longer than 40 characters', () => {
      expect(giteaAdapter.validateToken('a'.repeat(41) as Token)).toBe(false);
    });

    it('rejects tokens with non-hex characters', () => {
      expect(giteaAdapter.validateToken('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ' as Token)).toBe(
        false,
      );
    });

    it('rejects uppercase hex (Gitea normalises to lowercase)', () => {
      expect(giteaAdapter.validateToken('ABCDEF0123456789ABCDEF0123456789ABCDEF01' as Token)).toBe(
        false,
      );
    });

    it('accepts a 40-character lowercase hex token', () => {
      expect(giteaAdapter.validateToken('25da6ab8f66d379349b7b5cce0395c2092e2abb2' as Token)).toBe(
        true,
      );
    });
  });

  describe('fetchAuthenticatedUser', () => {
    it('maps the Gitea user payload onto the shared shape', async () => {
      vi.spyOn(client, 'fetchGiteaAuthenticatedUser').mockResolvedValue({
        id: 7,
        login: 'octocat',
        full_name: 'The Octocat',
        avatar_url: 'https://example.com/a.png',
      });

      const result = await giteaAdapter.fetchAuthenticatedUser(mockGiteaAccount);

      expect(result).toEqual({
        user: {
          id: '7',
          login: 'octocat',
          name: 'The Octocat',
          avatar: 'https://example.com/a.png',
        },
      });
    });

    it('falls back to null name and empty avatar when missing', async () => {
      vi.spyOn(client, 'fetchGiteaAuthenticatedUser').mockResolvedValue({
        id: 1,
        login: 'octocat',
      });

      const result = await giteaAdapter.fetchAuthenticatedUser(mockGiteaAccount);

      expect(result.user.name).toBeNull();
      expect(result.user.avatar).toBe('');
    });
  });

  describe('listNotifications', () => {
    it('returns transformed notifications', async () => {
      vi.spyOn(client, 'listGiteaNotifications').mockResolvedValue([
        {
          id: 99,
          unread: true,
          updated_at: '2024-01-15T12:00:00Z',
          url: 'https://gitea.example.com/api/v1/notifications/threads/99',
          subject: {
            title: 'Issue title',
            type: 'Issue',
            url: '',
            html_url: '',
          },
        },
      ]);

      const result = await giteaAdapter.listNotifications(mockGiteaAccount, {
        fetchAllNotifications: false,
        fetchReadNotifications: false,
      } as SettingsState);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('99');
      expect(result[0].account).toBe(mockGiteaAccount);
    });
  });

  describe('thread mutation methods', () => {
    it('markThreadAsRead PATCHes the thread to read', async () => {
      const patchSpy = vi
        .spyOn(client, 'patchGiteaNotificationThread')
        .mockResolvedValue(undefined);

      await giteaAdapter.markThreadAsRead(mockGiteaAccount, '12');

      expect(patchSpy).toHaveBeenCalledWith(mockGiteaAccount, '12', 'read');
    });

    it('markThreadAsDone throws — capability gate is the contract', () => {
      // The capability flag returns false for Gitea; the orchestrator falls
      // back to mark-as-read before reaching here. Throwing surfaces any
      // caller that bypasses the capability check rather than silently
      // doing the wrong thing.
      expect(() => giteaAdapter.markThreadAsDone(mockGiteaAccount, '13')).toThrow(
        /check capabilities.markAsDone/,
      );
    });

    it('unsubscribeThread throws because Gitea has no equivalent', () => {
      expect(() => giteaAdapter.unsubscribeThread(mockGiteaAccount, '14')).toThrow(
        /not supported for Gitea/,
      );
    });
  });

  describe('oauthScopes capability bundle', () => {
    it('is omitted because Gitea has no OAuth scope concept', () => {
      expect(giteaAdapter.oauthScopes).toBeUndefined();
    });
  });

  describe('followUrl', () => {
    it('delegates to giteaGetJson', async () => {
      const getJsonSpy = vi.spyOn(client, 'giteaGetJson').mockResolvedValue({ html_url: 'x' });

      const result = await giteaAdapter.followUrl<{ html_url: string }>(
        mockGiteaAccount,
        'https://gitea.example.com/api/v1/x' as Link,
      );

      expect(result).toEqual({ html_url: 'x' });
      expect(getJsonSpy).toHaveBeenCalledWith(
        mockGiteaAccount,
        'https://gitea.example.com/api/v1/x',
      );
    });
  });
});
