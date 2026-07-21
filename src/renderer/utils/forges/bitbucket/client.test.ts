import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockBitbucketAccount } from '../../../__mocks__/account-mocks';

import {
  fetchBitbucketAuthenticatedUser,
  listRawBitbucketNotifications,
  markBitbucketNotificationsAsRead,
  markBitbucketNotificationsAsUnread,
} from './client';
import {
  InfluentsNotificationCategory,
  InfluentsNotificationReadState,
} from './graphql/generated/graphql';

vi.mock('../../system/comms', () => ({
  decryptValue: vi.fn().mockResolvedValue({ token: 'decrypted-token' }),
}));

const makeRawNode = (registrationProduct: string) => ({
  groupId: 'g1',
  groupSize: 1,
  additionalActors: [],
  headNotification: {
    notificationId: 'n1',
    timestamp: '2024-01-01T00:00:00Z',
    readState: InfluentsNotificationReadState.Unread,
    category: InfluentsNotificationCategory.Direct,
    content: {
      type: 'pr:comment:added',
      message: 'Someone commented',
      url: 'https://bitbucket.org/org/repo/pull-requests/1',
      entity: {
        title: 'PR title',
        iconUrl: null,
        url: 'https://bitbucket.org/org/repo/pull-requests/1',
      },
      path: null,
      actor: { displayName: 'Bob', avatarURL: null },
    },
    analyticsAttributes: [{ key: 'registrationProduct', value: registrationProduct }],
  },
});

describe('listRawBitbucketNotifications', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('filters out non-Bitbucket notifications', async () => {
    const mockResponse = {
      data: {
        notifications: {
          unseenNotificationCount: 2,
          notificationFeed: {
            pageInfo: { hasNextPage: false },
            nodes: [makeRawNode('bitbucket'), makeRawNode('jira'), makeRawNode('confluence')],
          },
        },
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await listRawBitbucketNotifications(mockBitbucketAccount);
    expect(result).toHaveLength(1);
    expect(
      result[0].headNotification.analyticsAttributes?.find((a) => a.key === 'registrationProduct')
        ?.value,
    ).toBe('bitbucket');
  });

  it('returns empty array when no notifications', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          notifications: {
            unseenNotificationCount: 0,
            notificationFeed: { pageInfo: { hasNextPage: false }, nodes: [] },
          },
        },
      }),
    } as Response);

    const result = await listRawBitbucketNotifications(mockBitbucketAccount);
    expect(result).toHaveLength(0);
  });

  it('throws on non-OK HTTP response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as Response);

    await expect(listRawBitbucketNotifications(mockBitbucketAccount)).rejects.toThrow(
      'Atlassian API 401 Unauthorized',
    );
  });

  it('throws on GraphQL errors in response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        errors: [{ message: 'Unauthorized' }],
        data: null,
      }),
    } as Response);

    await expect(listRawBitbucketNotifications(mockBitbucketAccount)).rejects.toThrow(
      'Atlassian GraphQL errors',
    );
  });

  it('throws when account has no username', async () => {
    const accountWithoutUsername = { ...mockBitbucketAccount, username: undefined };
    await expect(listRawBitbucketNotifications(accountWithoutUsername)).rejects.toThrow(
      'Bitbucket account is missing username',
    );
  });
});

describe('markBitbucketNotificationsAsRead', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('calls the MarkAsRead mutation and resolves', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          notifications: { markNotificationsByIdsAsRead: 'ok' },
        },
      }),
    } as Response);

    await expect(
      markBitbucketNotificationsAsRead(mockBitbucketAccount, ['n1', 'n2']),
    ).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string);
    expect(body.variables.notificationIDs).toEqual(['n1', 'n2']);
  });

  it('throws on non-OK HTTP response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    } as Response);

    await expect(markBitbucketNotificationsAsRead(mockBitbucketAccount, ['n1'])).rejects.toThrow(
      'Atlassian API 403 Forbidden',
    );
  });
});

describe('markBitbucketNotificationsAsUnread', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('calls the MarkAsUnread mutation and resolves', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          notifications: { markNotificationsByIdsAsUnread: 'ok' },
        },
      }),
    } as Response);

    await expect(
      markBitbucketNotificationsAsUnread(mockBitbucketAccount, ['n1']),
    ).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string);
    expect(body.variables.notificationIDs).toEqual(['n1']);
  });

  it('throws on non-OK HTTP response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(markBitbucketNotificationsAsUnread(mockBitbucketAccount, ['n1'])).rejects.toThrow(
      'Atlassian API 500 Internal Server Error',
    );
  });
});

describe('fetchBitbucketAuthenticatedUser', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns the me query response on success', async () => {
    const mockResponse = {
      data: {
        me: {
          user: {
            accountId: 'atlas-001',
            name: 'Test User',
            picture: 'https://example.com/avatar.png',
          },
        },
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchBitbucketAuthenticatedUser(mockBitbucketAccount);

    expect(result.me?.user).toMatchObject({
      accountId: 'atlas-001',
      name: 'Test User',
      picture: 'https://example.com/avatar.png',
    });
  });

  it('throws on non-OK HTTP response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as Response);

    await expect(fetchBitbucketAuthenticatedUser(mockBitbucketAccount)).rejects.toThrow(
      'Atlassian API 401 Unauthorized',
    );
  });

  it('throws when account has no username', async () => {
    const accountWithoutUsername = { ...mockBitbucketAccount, username: undefined };
    await expect(fetchBitbucketAuthenticatedUser(accountWithoutUsername)).rejects.toThrow(
      'Bitbucket account is missing username',
    );
  });
});
