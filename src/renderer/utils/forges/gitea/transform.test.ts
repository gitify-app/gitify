import { mockGitHubCloudAccount } from '../../../__mocks__/account-mocks';

import type { Account, Hostname } from '../../../types';
import type { GiteaNotificationThread } from './types';

import { transformGiteaNotifications } from './transform';

describe('renderer/utils/forges/gitea/transform.ts', () => {
  const giteaAccount: Account = {
    ...mockGitHubCloudAccount,
    forge: 'gitea',
    platform: 'Gitea',
    hostname: 'gitea.example.com' as Hostname,
  };

  it('maps a Gitea pull-request thread to a GitifyNotification', () => {
    const raw: GiteaNotificationThread[] = [
      {
        id: 42,
        unread: true,
        updated_at: '2024-01-15T12:00:00Z',
        url: 'https://gitea.example.com/api/v1/notifications/threads/42',
        repository: {
          id: 1,
          name: 'repo',
          full_name: 'owner/repo',
          html_url: 'https://gitea.example.com/owner/repo',
          owner: {
            id: 2,
            login: 'owner',
            avatar_url: 'https://gitea.example.com/user/avatar/2',
          },
        },
        subject: {
          title: 'Fix bug',
          type: 'Pull',
          url: 'https://gitea.example.com/api/v1/repos/owner/repo/pulls/3',
          html_url: 'https://gitea.example.com/owner/repo/pulls/3',
          latest_comment_url: '',
        },
      },
    ];

    const [n] = transformGiteaNotifications(raw, giteaAccount);

    expect(n.id).toBe('42');
    expect(n.unread).toBe(true);
    expect(n.subject.type).toBe('PullRequest');
    expect(n.repository.fullName).toBe('owner/repo');
    expect(n.reason.code).toBe('subscribed');
  });

  it('falls back to placeholders when the thread is missing repo and subject', () => {
    const raw: GiteaNotificationThread[] = [
      {
        id: 7,
        unread: false,
        updated_at: '2024-01-15T12:00:00Z',
        url: 'https://gitea.example.com/api/v1/notifications/threads/7',
      },
    ];

    const [n] = transformGiteaNotifications(raw, giteaAccount);

    expect(n.repository.fullName).toBe('unknown');
    expect(n.subject.title).toBe('');
    expect(n.subject.type).toBe('Issue');
  });
});
