import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../../__mocks__/account-mocks';
import type { Link } from '../../../types';
import type {
  Notification,
  Owner,
  Repository,
  User,
} from '../../../typesGitHub';

export const mockNotificationUser = {
  id: 123456789,
  login: 'octocat',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
  url: 'https://api.github.com/users/octocat' as Link,
  html_url: 'https://github.com/octocat' as Link,
  type: 'User',
} satisfies Partial<User>;

// 2 Notifications
// Hostname : 'github.com'
// Repository : 'gitify-app/notifications-test'
const mockGitHubOwner: Owner = {
  id: 6333409,
  login: 'gitify-app',
  avatar_url:
    'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
  url: 'https://api.github.com/users/gitify-app' as Link,
  html_url: 'https://github.com/gitify-app' as Link,
  type: 'User',
} as unknown as Owner;

export const mockGitHubNotifications: Notification[] = [
  {
    account: mockGitHubCloudAccount,
    order: 0,
    id: '138661096',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T17:51:57Z',
    last_read_at: '2017-05-20T17:06:51Z',
    subject: {
      title: 'I am a robot and this is a test!',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
      latest_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
      type: 'Issue',
      state: 'OPEN',
      user: {
        login: 'gitify-app',
        html_url: 'https://github.com/gitify-app' as Link,
        avatar_url:
          'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
        type: 'User',
      },
      reviews: [
        {
          state: 'APPROVED',
          users: ['octocat'],
        },
        {
          state: 'CHANGES_REQUESTED',
          users: ['gitify-app'],
        },
        {
          state: 'PENDING',
          users: ['gitify-user'],
        },
      ],
    },
    repository: {
      id: 57216596,
      name: 'notifications-test',
      full_name: 'gitify-app/notifications-test',
      url: 'https://api.github.com/gitify-app/notifications-test' as Link,
      owner: mockGitHubOwner,
      html_url: 'https://github.com/gitify-app/notifications-test' as Link,
    } as unknown as Repository,
    url: 'https://api.github.com/notifications/threads/138661096' as Link,
    subscription_url:
      'https://api.github.com/notifications/threads/138661096/subscription' as Link,
  },
  {
    account: mockGitHubCloudAccount,
    order: 1,
    id: '148827438',
    unread: true,
    reason: 'author',
    updated_at: '2017-05-20T17:06:34Z',
    last_read_at: '2017-05-20T16:59:03Z',
    subject: {
      title: 'Improve the UI',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/4' as Link,
      latest_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302885965' as Link,
      type: 'Issue',
      reviews: null,
    },
    repository: {
      id: 57216596,
      name: 'notifications-test',
      full_name: 'gitify-app/notifications-test',
      owner: mockGitHubOwner,
      html_url: 'https://github.com/gitify-app/notifications-test' as Link,
    } as unknown as Repository,
    url: 'https://api.github.com/notifications/threads/148827438' as Link,
    subscription_url:
      'https://api.github.com/notifications/threads/148827438/subscription' as Link,
  },
];

// 2 Notifications
// Hostname : 'github.gitify.io'
// Repository : 'myorg/notifications-test'
const mockEnterpriseOwner = {
  login: 'myorg',
  id: 4,
  avatar_url: 'https://github.gitify.io/avatars/u/4?' as Link,
  url: 'https://github.gitify.io/api/v3/users/myorg',
  html_url: 'https://github.gitify.io/myorg' as Link,
  type: 'Organization',
} as unknown as Owner;

export const mockEnterpriseNotifications: Notification[] = [
  {
    account: mockGitHubEnterpriseServerAccount,
    order: 0,
    id: '3',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T13:02:48Z',
    last_read_at: null,
    subject: {
      title: 'Release 0.0.1',
      url: 'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/3' as Link,
      latest_comment_url:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/3' as Link,
      type: 'Release',
      reviews: null,
    },
    repository: {
      id: 1,
      name: 'notifications-test',
      full_name: 'myorg/notifications-test',
      owner: mockEnterpriseOwner,
      html_url: 'https://github.gitify.io/myorg/notifications-test' as Link,
    } as unknown as Repository,
    url: 'https://github.gitify.io/api/v3/notifications/threads/4' as Link,
    subscription_url:
      'https://github.gitify.io/api/v3/notifications/threads/4/subscription' as Link,
  },
  {
    account: mockGitHubEnterpriseServerAccount,
    order: 1,
    id: '4',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T15:52:20Z',
    last_read_at: '2017-05-20T14:20:55Z',
    subject: {
      title: 'Bump Version',
      url: 'https://github.gitify.io/api/v3/repos/myorg/notifications-test/pulls/4' as Link,
      latest_comment_url:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/issues/comments/21' as Link,
      type: 'PullRequest',
      reviews: null,
    },
    repository: {
      id: 1,
      name: 'notifications-test',
      full_name: 'myorg/notifications-test',
      owner: mockEnterpriseOwner,
      html_url: 'https://github.gitify.io/myorg/notifications-test' as Link,
    } as unknown as Repository,
    url: 'https://github.gitify.io/api/v3/notifications/threads/3' as Link,
    subscription_url:
      'https://github.gitify.io/api/v3/notifications/threads/3/subscription' as Link,
  },
];

export const mockSingleNotification: Notification = mockGitHubNotifications[0];
