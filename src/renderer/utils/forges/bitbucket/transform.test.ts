import { describe, expect, it } from 'vitest';

import { mockBitbucketAccount } from '../../../__mocks__/account-mocks';

import type { AtlassianNotificationFragment } from './types';

import {
  InfluentsNotificationCategory,
  InfluentsNotificationReadState,
} from './graphql/generated/graphql';
import { transformBitbucketNotifications } from './transform';

function makeMockNotification(
  overrides: Partial<AtlassianNotificationFragment> = {},
): AtlassianNotificationFragment {
  return {
    groupId: 'group-1',
    groupSize: 1,
    additionalActors: [],
    headNotification: {
      notificationId: 'notif-123',
      timestamp: '2024-01-01T00:00:00Z',
      readState: InfluentsNotificationReadState.Unread,
      category: InfluentsNotificationCategory.Direct,
      content: {
        type: 'pr:reviewer:approved',
        message: 'Alice approved your pull request',
        url: 'https://bitbucket.org/myorg/myrepo/pull-requests/42',
        entity: {
          title: 'Add new feature',
          iconUrl: null,
          url: 'https://bitbucket.org/myorg/myrepo/pull-requests/42',
        },
        path: [
          {
            title: 'myorg/myrepo',
            iconUrl: null,
            url: 'https://bitbucket.org/myorg/myrepo',
          },
        ],
        actor: {
          displayName: 'Alice',
          avatarURL: 'https://bitbucket.org/account/alice/avatar',
        },
      },
      analyticsAttributes: [{ key: 'registrationProduct', value: 'bitbucket' }],
    },
    ...overrides,
  };
}

describe('transformBitbucketNotifications', () => {
  it('transforms a basic Bitbucket notification', () => {
    const raw = makeMockNotification();
    const result = transformBitbucketNotifications([raw], mockBitbucketAccount);

    expect(result).toHaveLength(1);
    const notif = result[0];

    expect(notif.id).toBe('notif-123');
    expect(notif.unread).toBe(true);
    expect(notif.updatedAt).toBe('2024-01-01T00:00:00Z');
    expect(notif.account).toBe(mockBitbucketAccount);
    expect(notif.order).toBe(0);
  });

  it('maps reason from direct category to assign', () => {
    const raw = makeMockNotification({
      headNotification: {
        ...makeMockNotification().headNotification,
        category: InfluentsNotificationCategory.Direct,
      },
    });
    const [notif] = transformBitbucketNotifications(
      [raw],
      mockBitbucketAccount,
    );
    expect(notif.reason.code).toBe('assign');
  });

  it('maps reason from watching category to subscribed', () => {
    const raw = makeMockNotification({
      headNotification: {
        ...makeMockNotification().headNotification,
        category: InfluentsNotificationCategory.Watching,
      },
    });
    const [notif] = transformBitbucketNotifications(
      [raw],
      mockBitbucketAccount,
    );
    expect(notif.reason.code).toBe('subscribed');
  });

  it('sets subject type to BitbucketNotification', () => {
    const raw = makeMockNotification();
    const [notif] = transformBitbucketNotifications(
      [raw],
      mockBitbucketAccount,
    );
    expect(notif.subject.type).toBe('BitbucketNotification');
  });

  it('uses entity title as subject title', () => {
    const raw = makeMockNotification();
    const [notif] = transformBitbucketNotifications(
      [raw],
      mockBitbucketAccount,
    );
    expect(notif.subject.title).toBe('Add new feature');
  });

  it('sets subject url from entity url', () => {
    const raw = makeMockNotification();
    const [notif] = transformBitbucketNotifications(
      [raw],
      mockBitbucketAccount,
    );
    expect(notif.subject.url).toBe(
      'https://bitbucket.org/myorg/myrepo/pull-requests/42',
    );
  });

  it('extracts repository owner/repo from entity url', () => {
    const raw = makeMockNotification();
    const [notif] = transformBitbucketNotifications(
      [raw],
      mockBitbucketAccount,
    );
    expect(notif.repository.fullName).toBe('myorg/myrepo');
    expect(notif.repository.name).toBe('myrepo');
    expect(notif.repository.owner.login).toBe('myorg');
  });

  it('marks notification as read when readState is read', () => {
    const raw = makeMockNotification({
      headNotification: {
        ...makeMockNotification().headNotification,
        readState: InfluentsNotificationReadState.Read,
      },
    });
    const [notif] = transformBitbucketNotifications(
      [raw],
      mockBitbucketAccount,
    );
    expect(notif.unread).toBe(false);
  });

  it('handles missing entity url gracefully', () => {
    const raw = makeMockNotification();
    raw.headNotification.content.entity = null;
    raw.headNotification.content.url = null;

    const [notif] = transformBitbucketNotifications(
      [raw],
      mockBitbucketAccount,
    );
    expect(notif.subject.url).toBeNull();
    expect(notif.repository.fullName).toBe('bitbucket');
  });

  it('transforms multiple notifications', () => {
    const raw1 = makeMockNotification();
    const raw2 = makeMockNotification({
      headNotification: {
        ...makeMockNotification().headNotification,
        notificationId: 'notif-456',
      },
    });
    const result = transformBitbucketNotifications(
      [raw1, raw2],
      mockBitbucketAccount,
    );
    expect(result).toHaveLength(2);
    expect(result[1].id).toBe('notif-456');
  });
});
