import { mockGitHubCloudAccount } from '../../../__mocks__/account-mocks';

import type { Hostname, Link, SettingsState, Token } from '../../../types';

import * as client from './client';
import { githubAdapter } from './adapter';
import * as octokit from './octokit';

describe('renderer/utils/forges/github/adapter.ts', () => {
  describe('static fields', () => {
    it('identifies as github', () => {
      expect(githubAdapter.id).toBe('github');
      expect(githubAdapter.displayName).toBe('GitHub');
    });

    it('exposes the device-flow / PAT / OAuth login methods', () => {
      const ids = githubAdapter.loginMethods.map((m) => m.testId);
      expect(ids).toEqual(['login-github', 'login-pat', 'login-oauth-app']);
    });

    it('defaults the PAT hostname to github.com', () => {
      expect(githubAdapter.defaultHostname).toBe('github.com');
    });

    it('validates a 40-character token', () => {
      expect(
        githubAdapter.validateToken('a'.repeat(40) as Token),
      ).toBe(true);
      expect(githubAdapter.validateToken('short' as Token)).toBe(false);
    });

    it('builds the PAT settings URL via getNewTokenURL', () => {
      const url = githubAdapter.getPersonalAccessTokenSettingsUrl(
        'github.com' as Hostname,
      );
      expect(url).toContain('https://github.com/settings/tokens/new');
    });

    it('routes getDeveloperSettingsUrl through the auth-method helper', () => {
      expect(
        githubAdapter.getDeveloperSettingsUrl(mockGitHubCloudAccount),
      ).toBe('https://github.com/settings/tokens');
    });
  });

  describe('fetchAuthenticatedUser', () => {
    it('passes through the GitHub REST response shape', async () => {
      vi.spyOn(client, 'fetchAuthenticatedUserDetails').mockResolvedValue({
        data: { id: 1, login: 'octocat', name: null, avatar_url: 'a' },
        headers: { 'x-oauth-scopes': 'notifications,read:user' },
      } as unknown as Awaited<
        ReturnType<typeof client.fetchAuthenticatedUserDetails>
      >);

      const result = await githubAdapter.fetchAuthenticatedUser(
        mockGitHubCloudAccount,
      );

      expect(result.data.login).toBe('octocat');
      expect(result.headers['x-oauth-scopes']).toBe(
        'notifications,read:user',
      );
    });
  });

  describe('listNotifications', () => {
    it('lists notifications and transforms them to GitifyNotification', async () => {
      const settings = {} as SettingsState;
      vi.spyOn(client, 'listNotificationsForAuthenticatedUser').mockResolvedValue([
        {
          id: '1',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'Issue',
            type: 'Issue',
            url: 'https://api.github.com/x',
            latest_comment_url: null,
          },
          repository: {
            name: 'r',
            full_name: 'o/r',
            html_url: 'https://github.com/o/r',
            owner: {
              login: 'o',
              avatar_url: 'https://github.com/o.png',
              type: 'User',
            },
          },
        },
      ] as unknown as Awaited<
        ReturnType<typeof client.listNotificationsForAuthenticatedUser>
      >);

      const result = await githubAdapter.listNotifications(
        mockGitHubCloudAccount,
        settings,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].subject.type).toBe('Issue');
      expect(result[0].repository.fullName).toBe('o/r');
    });
  });

  describe('thread mutation methods', () => {
    it('markThreadAsRead delegates to the GitHub client', async () => {
      const spy = vi
        .spyOn(client, 'markNotificationThreadAsRead')
        .mockResolvedValue(undefined);

      await githubAdapter.markThreadAsRead(mockGitHubCloudAccount, '7');

      expect(spy).toHaveBeenCalledWith(mockGitHubCloudAccount, '7');
    });

    it('markThreadAsDone delegates to the GitHub client', async () => {
      const spy = vi
        .spyOn(client, 'markNotificationThreadAsDone')
        .mockResolvedValue(undefined);

      await githubAdapter.markThreadAsDone(mockGitHubCloudAccount, '8');

      expect(spy).toHaveBeenCalledWith(mockGitHubCloudAccount, '8');
    });

    it('unsubscribeThread delegates to the GitHub client', async () => {
      const spy = vi
        .spyOn(client, 'ignoreNotificationThreadSubscription')
        .mockResolvedValue(undefined as unknown as Awaited<
          ReturnType<typeof client.ignoreNotificationThreadSubscription>
        >);

      await githubAdapter.unsubscribeThread(mockGitHubCloudAccount, '9');

      expect(spy).toHaveBeenCalledWith(mockGitHubCloudAccount, '9');
    });
  });

  describe('followUrl', () => {
    it('issues a generic GET via Octokit and returns the response data', async () => {
      const requestMock = vi.fn().mockResolvedValue({
        data: { html_url: 'https://github.com/o/r/issues/1' },
      });
      vi.spyOn(octokit, 'createOctokitClient').mockResolvedValue({
        request: requestMock,
      } as unknown as Awaited<
        ReturnType<typeof octokit.createOctokitClient>
      >);

      const result = await githubAdapter.followUrl<{ html_url: string }>(
        mockGitHubCloudAccount,
        'https://api.github.com/repos/o/r/issues/1' as Link,
      );

      expect(result).toEqual({ html_url: 'https://github.com/o/r/issues/1' });
      expect(requestMock).toHaveBeenCalledWith('GET {+url}', {
        url: 'https://api.github.com/repos/o/r/issues/1',
      });
    });
  });
});
