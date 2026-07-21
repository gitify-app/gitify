import { KeyIcon } from '@primer/octicons-react';

import { mockBitbucketAccount } from '../../../__mocks__/account-mocks';
import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';

import { useSettingsStore } from '../../../stores';

import { BitbucketIcon } from '../../../components/icons/BitbucketIcon';

import type { Hostname, Link, Token } from '../../../types';
import { IconColor } from '../../../types';
import type { AtlassianNotificationFragment } from './types';

import { bitbucketAdapter } from './adapter';
import * as client from './client';
import {
  InfluentsNotificationCategory,
  InfluentsNotificationReadState,
} from './graphql/generated/graphql';

vi.mock('../../system/comms', () => ({
  decryptValue: vi.fn().mockResolvedValue({ token: 'decrypted-token' }),
}));

const makeMockFragment = (
  overrides: Partial<AtlassianNotificationFragment> = {},
): AtlassianNotificationFragment => ({
  groupId: 'group-1',
  groupSize: 1,
  additionalActors: [],
  headNotification: {
    notificationId: 'notif-abc',
    timestamp: '2024-06-01T10:00:00Z',
    readState: InfluentsNotificationReadState.Unread,
    category: InfluentsNotificationCategory.Direct,
    content: {
      type: 'pr:reviewer:approved',
      message: 'Alice approved your PR',
      url: 'https://bitbucket.org/myorg/myrepo/pull-requests/1',
      entity: {
        title: 'My PR',
        iconUrl: null,
        url: 'https://bitbucket.org/myorg/myrepo/pull-requests/1',
      },
      path: null,
      actor: { displayName: 'Alice', avatarURL: null },
    },
    analyticsAttributes: [{ key: 'registrationProduct', value: 'bitbucket' }],
  },
  ...overrides,
});

describe('renderer/utils/forges/bitbucket/adapter.ts', () => {
  describe('static fields', () => {
    it('identifies as bitbucket', () => {
      expect(bitbucketAdapter.id).toBe('bitbucket');
      expect(bitbucketAdapter.displayName).toBe('Bitbucket');
      expect(bitbucketAdapter.tagline).toBe('Bitbucket Cloud');
    });

    it('reports unsupported capabilities', () => {
      expect(bitbucketAdapter.capabilities.markAsDone(mockBitbucketAccount)).toBe(false);
      expect(bitbucketAdapter.capabilities.unsubscribeThread(mockBitbucketAccount)).toBe(false);
    });

    it('exposes a single PAT login method', () => {
      expect(bitbucketAdapter.loginMethods).toHaveLength(1);
      expect(bitbucketAdapter.loginMethods[0]).toMatchObject({
        testId: 'login-bitbucket-pat',
        route: '/login/bitbucket/personal-access-token',
        authMethod: 'Personal Access Token',
      });
    });

    it('sets the default hostname to bitbucket.org', () => {
      expect(bitbucketAdapter.defaultHostname).toBe('bitbucket.org');
    });

    it('returns the Atlassian token settings URL for PAT settings', () => {
      expect(bitbucketAdapter.getPersonalAccessTokenSettingsUrl('bitbucket.org' as Hostname)).toBe(
        'https://id.atlassian.com/manage-profile/security/api-tokens',
      );
    });

    it('returns the Atlassian token settings URL for account settings', () => {
      expect(bitbucketAdapter.getAccountSettingsUrl(mockBitbucketAccount)).toBe(
        'https://id.atlassian.com/manage-profile/security/api-tokens',
      );
    });

    it('returns the Atlassian docs URL', () => {
      expect(bitbucketAdapter.documentationUrl).toContain('atlassian.com');
    });

    it('returns KeyIcon for every auth method', () => {
      expect(bitbucketAdapter.getAuthMethodIcon('Personal Access Token')).toBe(KeyIcon);
      expect(bitbucketAdapter.getAuthMethodIcon('OAuth App')).toBe(KeyIcon);
    });
  });

  describe('validateToken', () => {
    it('accepts any non-empty token', () => {
      expect(bitbucketAdapter.validateToken('abc123' as Token)).toBe(true);
      expect(bitbucketAdapter.validateToken('a'.repeat(40) as Token)).toBe(true);
    });

    it('rejects an empty token', () => {
      expect(bitbucketAdapter.validateToken('' as Token)).toBe(false);
    });
  });

  describe('fetchAuthenticatedUser', () => {
    it('maps the Atlassian user payload onto the shared shape', async () => {
      vi.spyOn(client, 'fetchBitbucketAuthenticatedUser').mockResolvedValue({
        me: {
          user: {
            accountId: 'atlas-123',
            name: 'Alice Atlassian',
            picture: 'https://example.com/alice.png',
          },
        },
      });

      const result = await bitbucketAdapter.fetchAuthenticatedUser(mockBitbucketAccount);

      expect(result).toEqual({
        user: {
          id: 'atlas-123',
          login: mockBitbucketAccount.username,
          name: 'Alice Atlassian',
          avatar: 'https://example.com/alice.png',
        },
      });
    });

    it('falls back to accountId as login when account has no username', async () => {
      vi.spyOn(client, 'fetchBitbucketAuthenticatedUser').mockResolvedValue({
        me: {
          user: {
            accountId: 'atlas-456',
            name: 'Bob',
            picture: '',
          },
        },
      });

      const accountWithoutUsername = { ...mockBitbucketAccount, username: undefined };
      const result = await bitbucketAdapter.fetchAuthenticatedUser(accountWithoutUsername);

      expect(result.user.login).toBe('atlas-456');
    });

    it('falls back to null name and empty avatar when fields are missing', async () => {
      vi.spyOn(client, 'fetchBitbucketAuthenticatedUser').mockResolvedValue({
        me: {
          user: {
            accountId: 'atlas-789',
            name: null as unknown as string,
            picture: null as unknown as string,
          },
        },
      });

      const result = await bitbucketAdapter.fetchAuthenticatedUser(mockBitbucketAccount);

      expect(result.user.name).toBeNull();
      expect(result.user.avatar).toBe('');
    });

    it('throws when the user field is null', async () => {
      vi.spyOn(client, 'fetchBitbucketAuthenticatedUser').mockResolvedValue({
        me: { user: null },
      });

      await expect(bitbucketAdapter.fetchAuthenticatedUser(mockBitbucketAccount)).rejects.toThrow(
        'Failed to retrieve Bitbucket authenticated user.',
      );
    });
  });

  describe('listNotifications', () => {
    it('fetches only unread notifications when fetchReadNotifications is false', async () => {
      const listSpy = vi
        .spyOn(client, 'listRawBitbucketNotifications')
        .mockResolvedValue([makeMockFragment()]);

      useSettingsStore.setState({ fetchReadNotifications: false });

      const result = await bitbucketAdapter.listNotifications(mockBitbucketAccount);

      expect(listSpy).toHaveBeenCalledWith(mockBitbucketAccount, true);
      expect(result).toHaveLength(1);
      expect(result[0].account).toBe(mockBitbucketAccount);
    });

    it('fetches all notifications when fetchReadNotifications is true', async () => {
      const listSpy = vi.spyOn(client, 'listRawBitbucketNotifications').mockResolvedValue([]);

      useSettingsStore.setState({ fetchReadNotifications: true });

      await bitbucketAdapter.listNotifications(mockBitbucketAccount);

      expect(listSpy).toHaveBeenCalledWith(mockBitbucketAccount, false);
    });
  });

  describe('thread mutation methods', () => {
    it('markThreadAsRead delegates to markBitbucketNotificationsAsRead', async () => {
      const markSpy = vi
        .spyOn(client, 'markBitbucketNotificationsAsRead')
        .mockResolvedValue(undefined);

      await bitbucketAdapter.markThreadAsRead(mockBitbucketAccount, 'notif-abc');

      expect(markSpy).toHaveBeenCalledWith(mockBitbucketAccount, ['notif-abc']);
    });

    it('markThreadAsDone throws — check capabilities before calling', () => {
      expect(() => bitbucketAdapter.markThreadAsDone(mockBitbucketAccount, 'notif-abc')).toThrow(
        /check capabilities.markAsDone/,
      );
    });

    it('unsubscribeThread throws — check capabilities before calling', () => {
      expect(() => bitbucketAdapter.unsubscribeThread(mockBitbucketAccount, 'notif-abc')).toThrow(
        /not supported for Bitbucket/,
      );
    });
  });

  describe('followUrl', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    it('fetches the URL with Basic auth and returns the parsed JSON', async () => {
      const payload = { key: 'value' };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => payload,
      } as Response);

      const result = await bitbucketAdapter.followUrl<{ key: string }>(
        mockBitbucketAccount,
        'https://bitbucket.org/api/resource' as Link,
      );

      expect(result).toEqual(payload);
      const call = vi.mocked(fetch).mock.calls[0];
      expect(call[0]).toBe('https://bitbucket.org/api/resource');
      const headers = (call[1] as RequestInit).headers as Record<string, string>;
      expect(headers.Authorization).toMatch(/^Basic /);
    });

    it('throws a descriptive error on non-OK HTTP response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(
        bitbucketAdapter.followUrl(mockBitbucketAccount, 'https://bitbucket.org/missing' as Link),
      ).rejects.toThrow('Bitbucket fetch error: 404');
    });
  });

  describe('getDisplayHelpers', () => {
    it('returns the key icon with gray color and the notification subject URL', () => {
      const notification = mockPartialGitifyNotification(
        {
          title: 'Bitbucket PR comment',
          type: 'BitbucketNotification',
          url: 'https://bitbucket.org/myorg/myrepo/pull-requests/1' as Link,
        },
        {
          htmlUrl: 'https://bitbucket.org/myorg/myrepo' as Link,
        },
      );
      notification.account = mockBitbucketAccount;

      const helpers = bitbucketAdapter.getDisplayHelpers(notification);

      expect(helpers.iconType).toBe(BitbucketIcon);
      expect(helpers.iconColor).toBe(IconColor.GRAY);
      expect(helpers.defaultUrl).toBe('https://bitbucket.org/myorg/myrepo/pull-requests/1');
      expect(helpers.defaultUserType).toBe('User');
    });

    it('falls back to an empty string when the subject has no URL', () => {
      const notification = mockPartialGitifyNotification({
        title: 'Bitbucket notification',
        type: 'BitbucketNotification',
        url: null,
      });
      notification.account = mockBitbucketAccount;

      const helpers = bitbucketAdapter.getDisplayHelpers(notification);

      expect(helpers.defaultUrl).toBe('');
    });
  });
});
