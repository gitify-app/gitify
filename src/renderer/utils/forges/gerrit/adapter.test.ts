import { KeyIcon } from '@primer/octicons-react';

import { mockGerritAccount } from '../../../__mocks__/account-mocks';
import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';

import type { Hostname, Link, Token } from '../../../types';

import * as logger from '../../core/logger';
import { gerritAdapter } from './adapter';
import * as client from './client';

describe('renderer/utils/forges/gerrit/adapter.ts', () => {
  describe('static fields', () => {
    it('identifies as gerrit', () => {
      expect(gerritAdapter.id).toBe('gerrit');
      expect(gerritAdapter.displayName).toBe('Gerrit');
    });

    it('reports unsupported capabilities', () => {
      expect(gerritAdapter.accountOps.capabilities.markAsDone(mockGerritAccount)).toBe(false);
      expect(gerritAdapter.accountOps.capabilities.unsubscribeThread(mockGerritAccount)).toBe(
        false,
      );
    });

    it('does not implement detailed enrichment', () => {
      expect(gerritAdapter.enrichNotifications).toBeUndefined();
    });

    it('exposes a single PAT login method', () => {
      expect(gerritAdapter.loginMethods).toHaveLength(1);
      expect(gerritAdapter.loginMethods[0]).toMatchObject({
        testId: 'login-gerrit-pat',
        route: '/login/gerrit/personal-access-token',
        authMethod: 'Personal Access Token',
      });
    });

    it('builds PAT settings and account settings URLs from the hostname', () => {
      expect(
        gerritAdapter.getPersonalAccessTokenSettingsUrl('gerrit.example.com' as Hostname),
      ).toBe('https://gerrit.example.com/settings/#HTTPCredentials');

      expect(gerritAdapter.accountOps.getAccountSettingsUrl(mockGerritAccount)).toBe(
        'https://gerrit.example.com/settings/#HTTPCredentials',
      );
    });

    it('returns the key icon for every auth method (PAT-only forge today)', () => {
      expect(gerritAdapter.getAuthMethodIcon('Personal Access Token')).toBe(KeyIcon);
      expect(gerritAdapter.getAuthMethodIcon('Gitify OAuth App')).toBe(KeyIcon);
      expect(gerritAdapter.getAuthMethodIcon('Custom OAuth App')).toBe(KeyIcon);
    });

    it('formats the user login without an "@" prefix', () => {
      expect(gerritAdapter.formatUserLogin('jdoe')).toBe('jdoe');
    });

    it('omits the OAuth scopes capability bundle', () => {
      expect(gerritAdapter.accountOps.oauthScopes).toBeUndefined();
    });

    it('omits device-flow and OAuth-app bundles', () => {
      expect(gerritAdapter.deviceFlow).toBeUndefined();
      expect(gerritAdapter.customOAuthApp).toBeUndefined();
    });
  });

  describe('validateToken', () => {
    it('rejects an empty token', () => {
      expect(gerritAdapter.validateToken('' as Token)).toBe(false);
    });

    it('accepts any non-empty token (no fixed Gerrit token format)', () => {
      expect(gerritAdapter.validateToken('any-non-empty-value' as Token)).toBe(true);
    });
  });

  describe('fetchAuthenticatedUser', () => {
    it('maps the Gerrit account payload onto the shared shape', async () => {
      vi.spyOn(client, 'fetchGerritAuthenticatedUser').mockResolvedValue({
        account: {
          _account_id: 7,
          username: 'jdoe',
          name: 'John Doe',
          avatars: [{ url: 'https://example.com/a.png', height: 64 }],
        },
        version: '3.13.2',
      });

      const result = await gerritAdapter.accountOps.fetchAuthenticatedUser(mockGerritAccount);

      expect(result).toEqual({
        user: {
          id: '7',
          login: 'jdoe',
          name: 'John Doe',
          avatar: 'https://example.com/a.png',
        },
        version: '3.13.2',
      });
    });

    it('falls back to null name, empty avatar, and numeric-id login when missing', async () => {
      vi.spyOn(client, 'fetchGerritAuthenticatedUser').mockResolvedValue({
        account: { _account_id: 1 },
        version: undefined,
      });

      const result = await gerritAdapter.accountOps.fetchAuthenticatedUser(mockGerritAccount);

      expect(result.user.login).toBe('1');
      expect(result.user.name).toBeNull();
      expect(result.user.avatar).toBe('');
      expect(result.version).toBeUndefined();
    });

    it.each(['3.9.0', '3.11.0'])('warns but allows login on Gerrit %s', async (version) => {
      const warnSpy = vi.spyOn(logger, 'rendererLogWarn').mockImplementation(vi.fn());
      vi.spyOn(client, 'fetchGerritAuthenticatedUser').mockResolvedValue({
        account: { _account_id: 1, username: 'jdoe' },
        version,
      });

      await expect(
        gerritAdapter.accountOps.fetchAuthenticatedUser(mockGerritAccount),
      ).resolves.toMatchObject({ user: { id: '1', login: 'jdoe' }, version });
      expect(warnSpy).toHaveBeenCalledExactlyOnceWith(
        'gerrit:fetchAuthenticatedUser',
        `Gerrit server version ${version} is older than the recommended 3.12.0. Login is allowed, but compatibility is not guaranteed.`,
      );
    });

    it.each([undefined, 'unknown', '3.12.0', '3.13.2'])(
      'allows login without a version warning for %s',
      async (version) => {
        const warnSpy = vi.spyOn(logger, 'rendererLogWarn').mockImplementation(vi.fn());
        vi.spyOn(client, 'fetchGerritAuthenticatedUser').mockResolvedValue({
          account: { _account_id: 1, username: 'jdoe' },
          version,
        });

        await expect(
          gerritAdapter.accountOps.fetchAuthenticatedUser(mockGerritAccount),
        ).resolves.toBeDefined();
        expect(warnSpy).not.toHaveBeenCalled();
      },
    );
  });

  describe('listNotifications', () => {
    it('returns transformed notifications', async () => {
      vi.spyOn(client, 'listGerritChanges').mockResolvedValue([
        {
          id: 'proj~99',
          project: 'proj',
          branch: 'main',
          change_id: 'Iabc',
          subject: 'A change',
          status: 'NEW',
          created: '2024-01-15 10:00:00.000000000',
          updated: '2024-01-15 12:00:00.000000000',
          _number: 99,
          owner: { _account_id: 1, username: 'jdoe' },
        },
      ]);

      const result = await gerritAdapter.accountOps.listNotifications(mockGerritAccount);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('proj~99');
      expect(result[0].account).toBe(mockGerritAccount);
    });
  });

  describe('thread mutation methods', () => {
    it('markThreadAsRead removes the caller from the attention set', async () => {
      const removeSpy = vi.spyOn(client, 'removeSelfFromAttentionSet').mockResolvedValue(undefined);

      await gerritAdapter.accountOps.markThreadAsRead(mockGerritAccount, 'proj~12');

      expect(removeSpy).toHaveBeenCalledWith(
        mockGerritAccount,
        'proj~12',
        'Marked as read via Gitify',
      );
    });

    it('markThreadAsDone throws — capability gate is the contract', () => {
      expect(() => gerritAdapter.accountOps.markThreadAsDone(mockGerritAccount, 'proj~13')).toThrow(
        /check capabilities.markAsDone/,
      );
    });

    it('unsubscribeThread throws because Gerrit has no equivalent', () => {
      expect(() =>
        gerritAdapter.accountOps.unsubscribeThread(mockGerritAccount, 'proj~14'),
      ).toThrow(/not supported for Gerrit/);
    });
  });

  describe('followUrl', () => {
    it('delegates to gerritGetJson', async () => {
      const getJsonSpy = vi.spyOn(client, 'gerritGetJson').mockResolvedValue({ subject: 'x' });

      const result = await gerritAdapter.accountOps.followUrl<{ subject: string }>(
        mockGerritAccount,
        'https://gerrit.example.com/a/changes/proj~1' as Link,
      );

      expect(result).toEqual({ subject: 'x' });
      expect(getJsonSpy).toHaveBeenCalledWith(
        mockGerritAccount,
        'https://gerrit.example.com/a/changes/proj~1',
      );
    });
  });

  describe('getDisplayHelpers', () => {
    it('returns icon/color/url helpers via the shared subject-type handlers', () => {
      const notification = mockPartialGitifyNotification(
        {
          title: 'Gerrit change',
          type: 'PullRequest',
          state: 'OPEN',
        },
        {
          htmlUrl: 'https://gerrit.example.com/admin/repos/proj' as Link,
        },
      );
      notification.account = mockGerritAccount;

      const helpers = gerritAdapter.getDisplayHelpers(notification);

      expect(helpers.iconType).toBeDefined();
      expect(helpers.iconColor).toBeDefined();
      expect(helpers.defaultUserType).toBe('User');
    });
  });
});
