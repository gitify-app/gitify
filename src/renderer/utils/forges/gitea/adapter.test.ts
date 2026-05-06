import { mockGiteaAccount } from '../../../__mocks__/account-mocks';

import type { Hostname, Link, SettingsState, Token } from '../../../types';

import * as client from './client';
import { giteaAdapter } from './adapter';

describe('renderer/utils/forges/gitea/adapter.ts', () => {
  describe('static fields', () => {
    it('identifies as gitea', () => {
      expect(giteaAdapter.id).toBe('gitea');
      expect(giteaAdapter.displayName).toBe('Gitea');
    });

    it('reports unsupported capabilities', () => {
      expect(giteaAdapter.capabilities.markAsDone(mockGiteaAccount)).toBe(
        false,
      );
      expect(
        giteaAdapter.capabilities.unsubscribeThread(mockGiteaAccount),
      ).toBe(false);
      expect(giteaAdapter.capabilities.enrichment(mockGiteaAccount)).toBe(false);
      expect(
        giteaAdapter.capabilities.answeredDiscussion(mockGiteaAccount),
      ).toBe(false);
    });

    it('exposes a single PAT login method', () => {
      expect(giteaAdapter.loginMethods).toHaveLength(1);
      expect(giteaAdapter.loginMethods[0]).toMatchObject({
        testId: 'login-gitea-pat',
        route: '/login-personal-access-token',
        state: { forge: 'gitea' },
      });
    });

    it('builds PAT settings and developer settings URLs from the hostname', () => {
      expect(
        giteaAdapter.getPersonalAccessTokenSettingsUrl(
          'gitea.example.com' as Hostname,
        ),
      ).toBe('https://gitea.example.com/user/settings/applications');

      expect(giteaAdapter.getDeveloperSettingsUrl(mockGiteaAccount)).toBe(
        'https://gitea.example.com/user/settings/applications',
      );
    });
  });

  describe('validateToken', () => {
    it('rejects tokens shorter than 8 characters', () => {
      expect(giteaAdapter.validateToken('short' as Token)).toBe(false);
    });

    it('rejects tokens longer than 512 characters', () => {
      expect(giteaAdapter.validateToken('x'.repeat(513) as Token)).toBe(false);
    });

    it('rejects tokens that contain newlines', () => {
      expect(giteaAdapter.validateToken('abcd1234\n' as Token)).toBe(false);
    });

    it('accepts a normal Gitea token', () => {
      expect(giteaAdapter.validateToken('abcdefgh12345678' as Token)).toBe(
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

      const result = await giteaAdapter.fetchAuthenticatedUser(
        mockGiteaAccount,
      );

      expect(result).toEqual({
        data: {
          id: 7,
          login: 'octocat',
          name: 'The Octocat',
          avatar_url: 'https://example.com/a.png',
        },
        headers: {},
      });
    });

    it('falls back to null name and empty avatar when missing', async () => {
      vi.spyOn(client, 'fetchGiteaAuthenticatedUser').mockResolvedValue({
        id: 1,
        login: 'octocat',
      });

      const result = await giteaAdapter.fetchAuthenticatedUser(
        mockGiteaAccount,
      );

      expect(result.data.name).toBeNull();
      expect(result.data.avatar_url).toBe('');
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

    it('markThreadAsDone falls back to PATCH read (Gitea has no done state)', async () => {
      const patchSpy = vi
        .spyOn(client, 'patchGiteaNotificationThread')
        .mockResolvedValue(undefined);

      await giteaAdapter.markThreadAsDone(mockGiteaAccount, '13');

      expect(patchSpy).toHaveBeenCalledWith(mockGiteaAccount, '13', 'read');
    });

    it('unsubscribeThread throws because Gitea has no equivalent', () => {
      expect(() =>
        giteaAdapter.unsubscribeThread(mockGiteaAccount, '14'),
      ).toThrow(/not supported for Gitea/);
    });
  });

  describe('followUrl', () => {
    it('delegates to giteaGetJson', async () => {
      const getJsonSpy = vi
        .spyOn(client, 'giteaGetJson')
        .mockResolvedValue({ html_url: 'x' });

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
