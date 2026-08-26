import { KeyIcon } from '@primer/octicons-react';

import { mockGitLabAccount } from '../../../__mocks__/account-mocks';
import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';

import { useSettingsStore } from '../../../stores';

import { GitLabIcon } from '../../../components/icons/GitLabIcon';

import type { Account, GitifyNotificationUser, Hostname, Link, Token } from '../../../types';

import { gitlabAdapter } from './adapter';
import * as client from './client';

describe('renderer/utils/forges/gitlab/adapter.ts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('static fields', () => {
    it('identifies as gitlab', () => {
      expect(gitlabAdapter.id).toBe('gitlab');
      expect(gitlabAdapter.displayName).toBe('GitLab');
      expect(gitlabAdapter.icon).toBe(GitLabIcon);
    });

    it('supports mark-as-done because that is GitLab’s only transition', () => {
      expect(gitlabAdapter.capabilities.markAsDone(mockGitLabAccount)).toBe(true);
      expect(gitlabAdapter.capabilities.unsubscribeThread(mockGitLabAccount)).toBe(false);
    });

    it('does not implement detailed enrichment', () => {
      // The to-do payload embeds the full target, so there is nothing to enrich.
      expect(gitlabAdapter.enrichNotifications).toBeUndefined();
    });

    it('uses plain logins for account identity surfaces', () => {
      expect(gitlabAdapter.formatUserLogin('octocat')).toBe('octocat');
      expect(
        gitlabAdapter.formatNotificationUser(mockGitLabAccount, {
          login: 'octocat',
          avatarUrl: '' as Link,
          htmlUrl: '' as Link,
          type: 'User',
        } satisfies GitifyNotificationUser),
      ).toBe('octocat');
    });

    it('exposes a single PAT login method', () => {
      expect(gitlabAdapter.loginMethods).toHaveLength(1);
      expect(gitlabAdapter.loginMethods[0]).toMatchObject({
        testId: 'login-gitlab-pat',
        route: '/login/gitlab/personal-access-token',
        authMethod: 'Personal Access Token',
      });
    });

    it('defaults to gitlab.com', () => {
      expect(gitlabAdapter.defaultHostname).toBe('gitlab.com');
    });

    it('builds PAT settings and account settings URLs from the hostname', () => {
      expect(gitlabAdapter.getPersonalAccessTokenSettingsUrl('gitlab.com' as Hostname)).toBe(
        'https://gitlab.com/-/user_settings/personal_access_tokens',
      );
      expect(gitlabAdapter.getAccountSettingsUrl(mockGitLabAccount)).toBe(
        'https://gitlab.com/-/user_settings/personal_access_tokens',
      );
    });

    it('returns the key icon for every auth method (PAT-only forge today)', () => {
      expect(gitlabAdapter.getAuthMethodIcon('Personal Access Token')).toBe(KeyIcon);
      expect(gitlabAdapter.getAuthMethodIcon('OAuth App')).toBe(KeyIcon);
    });

    it('omits the oauthScopes bundle', () => {
      expect(gitlabAdapter.oauthScopes).toBeUndefined();
    });
  });

  describe('getPlatform', () => {
    it('reports gitlab.com as cloud', () => {
      expect(gitlabAdapter.getPlatform('gitlab.com' as Hostname)).toBe('GitLab Cloud');
    });

    it('reports any other hostname as self-managed', () => {
      expect(gitlabAdapter.getPlatform('gitlab.example.com' as Hostname)).toBe(
        'GitLab Self-Managed',
      );
    });
  });

  describe('validateToken', () => {
    it('accepts the modern routing-prefixed token format', () => {
      // Live gitlab.com tokens are 62 chars and contain dots — a length- or
      // shape-pinned regex would reject them.
      expect(
        gitlabAdapter.validateToken(
          'glpat-cEj977iancWuTGoHQbbpGWM6MQpvOjEKdToxcDBrNw8.01.1711l2dhw' as Token,
        ),
      ).toBe(true);
    });

    it('accepts the legacy 26-character token format', () => {
      expect(gitlabAdapter.validateToken('glpat-ABCDEFGHIJKLMNOPQRST' as Token)).toBe(true);
    });

    it('accepts tokens with a custom prefix (self-managed admins can change it)', () => {
      expect(gitlabAdapter.validateToken('company-prefix-abc123' as Token)).toBe(true);
    });

    it('rejects empty and whitespace-only tokens', () => {
      expect(gitlabAdapter.validateToken('' as Token)).toBe(false);
      expect(gitlabAdapter.validateToken('   ' as Token)).toBe(false);
    });
  });

  describe('fetchAuthenticatedUser', () => {
    it('maps the GitLab user payload and attaches version and scopes', async () => {
      vi.spyOn(client, 'fetchGitLabAuthenticatedUser').mockResolvedValue({
        id: 2846743,
        username: 'afonsojramos',
        name: 'Afonso Jorge Ramos',
        avatar_url: 'https://gitlab.com/avatar.png',
      });
      vi.spyOn(client, 'fetchGitLabVersion').mockResolvedValue({
        version: '19.4.0',
        revision: 'abc',
      });
      vi.spyOn(client, 'fetchGitLabTokenMetadata').mockResolvedValue({
        id: 1,
        name: 'gitify',
        scopes: ['api'],
        active: true,
        revoked: false,
        expires_at: null,
      });

      const result = await gitlabAdapter.fetchAuthenticatedUser(mockGitLabAccount);

      expect(result).toEqual({
        user: {
          id: '2846743',
          login: 'afonsojramos',
          name: 'Afonso Jorge Ramos',
          avatar: 'https://gitlab.com/avatar.png',
        },
        version: '19.4.0',
        scopes: ['api'],
      });
    });

    it('falls back to null name and empty avatar when missing', async () => {
      vi.spyOn(client, 'fetchGitLabAuthenticatedUser').mockResolvedValue({
        id: 1,
        username: 'octocat',
      });
      vi.spyOn(client, 'fetchGitLabVersion').mockResolvedValue({
        version: '19.4.0',
        revision: 'abc',
      });
      vi.spyOn(client, 'fetchGitLabTokenMetadata').mockRejectedValue(new Error('nope'));

      const result = await gitlabAdapter.fetchAuthenticatedUser(mockGitLabAccount);

      expect(result.user.name).toBeNull();
      expect(result.user.avatar).toBe('');
    });

    it('still logs in when version and scope lookups fail', async () => {
      // A read_api token cannot read its own metadata; that must not block login.
      vi.spyOn(client, 'fetchGitLabAuthenticatedUser').mockResolvedValue({
        id: 1,
        username: 'octocat',
      });
      vi.spyOn(client, 'fetchGitLabVersion').mockRejectedValue(new Error('403'));
      vi.spyOn(client, 'fetchGitLabTokenMetadata').mockRejectedValue(new Error('403'));

      const result = await gitlabAdapter.fetchAuthenticatedUser(mockGitLabAccount);

      expect(result.user.login).toBe('octocat');
      expect(result.version).toBeUndefined();
      expect(result.scopes).toBeUndefined();
    });

    it('propagates a failure to read the authenticated user', async () => {
      vi.spyOn(client, 'fetchGitLabAuthenticatedUser').mockRejectedValue(
        new Error('GitLab API 401 Unauthorized'),
      );

      await expect(gitlabAdapter.fetchAuthenticatedUser(mockGitLabAccount)).rejects.toThrow(
        /401 Unauthorized/,
      );
    });
  });

  describe('listNotifications', () => {
    it('returns transformed to-do items', async () => {
      vi.spyOn(client, 'listGitLabTodos').mockResolvedValue([
        {
          id: 99,
          action_name: 'assigned',
          target_type: 'Issue',
          target_url: 'https://gitlab.com/o/r/-/issues/1',
          body: 'Issue title',
          state: 'pending',
          created_at: '2026-01-15T12:00:00Z',
          updated_at: '2026-01-15T12:00:00Z',
        },
      ]);

      useSettingsStore.setState({ fetchAllNotifications: false, fetchReadNotifications: false });

      const result = await gitlabAdapter.listNotifications(mockGitLabAccount);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('99');
      expect(result[0].account).toBe(mockGitLabAccount);
    });
  });

  describe('thread mutation methods', () => {
    it('markThreadAsRead marks the to-do item done', async () => {
      const spy = vi.spyOn(client, 'markGitLabTodoAsDone').mockResolvedValue(undefined);

      await gitlabAdapter.markThreadAsRead(mockGitLabAccount, '12');

      expect(spy).toHaveBeenCalledWith(mockGitLabAccount, '12');
    });

    it('markThreadAsDone hits the same endpoint — GitLab has one transition', async () => {
      const spy = vi.spyOn(client, 'markGitLabTodoAsDone').mockResolvedValue(undefined);

      await gitlabAdapter.markThreadAsDone(mockGitLabAccount, '13');

      expect(spy).toHaveBeenCalledWith(mockGitLabAccount, '13');
    });

    it('unsubscribeThread throws because the capability is off', () => {
      expect(() => gitlabAdapter.unsubscribeThread(mockGitLabAccount, '14')).toThrow(
        /not supported for GitLab/,
      );
    });
  });

  describe('followUrl', () => {
    it('delegates to gitlabGetJson', async () => {
      const spy = vi.spyOn(client, 'gitlabGetJson').mockResolvedValue({ web_url: 'x' });

      const result = await gitlabAdapter.followUrl<{ web_url: string }>(
        mockGitLabAccount,
        'https://gitlab.com/api/v4/x' as Link,
      );

      expect(result).toEqual({ web_url: 'x' });
      expect(spy).toHaveBeenCalledWith(mockGitLabAccount, 'https://gitlab.com/api/v4/x');
    });
  });

  describe('getDisplayHelpers', () => {
    it('prefers the to-do deep link over the handler-derived URL', () => {
      const notification = mockPartialGitifyNotification(
        { title: 'GitLab issue', type: 'Issue', state: 'OPEN' },
        { htmlUrl: 'https://gitlab.com/o/r' as Link },
      );
      notification.account = mockGitLabAccount;
      notification.subject.htmlUrl = 'https://gitlab.com/o/r/-/issues/1' as Link;

      const helpers = gitlabAdapter.getDisplayHelpers(notification);

      expect(helpers.defaultUrl).toBe('https://gitlab.com/o/r/-/issues/1');
      expect(helpers.iconType).toBeDefined();
      expect(helpers.defaultUserType).toBe('User');
    });

    it('uses the GitLab icon for unmapped target types', () => {
      const notification = mockPartialGitifyNotification(
        { title: 'Epic', type: 'GitLabTodo' },
        { htmlUrl: 'https://gitlab.com/o/r' as Link },
      );
      notification.account = mockGitLabAccount;
      notification.subject.htmlUrl = 'https://gitlab.com/groups/o/-/epics/1' as Link;

      const helpers = gitlabAdapter.getDisplayHelpers(notification);

      expect(helpers.iconType).toBe(GitLabIcon);
      expect(helpers.defaultUrl).toBe('https://gitlab.com/groups/o/-/epics/1');
    });

    it('falls back to the repository URL when the subject has no deep link', () => {
      const notification = mockPartialGitifyNotification(
        { title: 'Epic', type: 'GitLabTodo' },
        { htmlUrl: 'https://gitlab.com/o/r' as Link },
      );
      notification.account = mockGitLabAccount;
      notification.subject.htmlUrl = undefined;

      const helpers = gitlabAdapter.getDisplayHelpers(notification);

      expect(helpers.defaultUrl).toBe('https://gitlab.com/o/r');
    });
  });

  describe('onAccountTokenChange', () => {
    it('is omitted because the client holds no cache', () => {
      expect(gitlabAdapter.onAccountTokenChange).toBeUndefined();
    });
  });

  describe('account shape', () => {
    it('accepts a self-managed account hostname', () => {
      const selfManaged = {
        ...mockGitLabAccount,
        hostname: 'gitlab.example.com' as Hostname,
      } satisfies Account;

      expect(gitlabAdapter.getAccountSettingsUrl(selfManaged)).toBe(
        'https://gitlab.example.com/-/user_settings/personal_access_tokens',
      );
    });
  });
});
