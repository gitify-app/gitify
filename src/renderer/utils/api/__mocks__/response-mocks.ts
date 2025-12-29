import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../../__mocks__/account-mocks';
import type {
  GitifyNotification,
  GitifyNotificationUser,
  GitifyOwner,
  GitifyRepository,
  Link,
} from '../../../types';
import type { RawUser } from '../types';

export const mockNotificationUser = {
  id: 123456789,
  login: 'octocat',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
  url: 'https://api.github.com/users/octocat' as Link,
  html_url: 'https://github.com/octocat' as Link,
  type: 'User',
} satisfies Partial<RawUser>;

// 2 Notifications
// Hostname : 'github.com'
// Repository : 'gitify-app/notifications-test'
const mockGitHubOwner: GitifyOwner = {
  login: 'gitify-app',
  avatarUrl:
    'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
  type: 'User',
};

const mockGitHubRepository: GitifyRepository = {
  name: 'notifications-test',
  fullName: 'gitify-app/notifications-test',
  owner: mockGitHubOwner,
  htmlUrl: 'https://github.com/gitify-app/notifications-test' as Link,
};

const mockSubjectUser: GitifyNotificationUser = {
  login: 'gitify-app',
  htmlUrl: 'https://github.com/gitify-app' as Link,
  avatarUrl:
    'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
  type: 'User',
};

export const mockGitHubNotifications: GitifyNotification[] = [
  {
    account: mockGitHubCloudAccount,
    order: 0,
    id: '138661096',
    unread: true,
    reason: 'subscribed',
    updatedAt: '2017-05-20T17:51:57Z',
    subject: {
      title: 'I am a robot and this is a test!',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
      latestCommentUrl:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
      type: 'Issue',
      state: 'OPEN',
      user: mockSubjectUser,
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
    repository: mockGitHubRepository,
  },
  {
    account: mockGitHubCloudAccount,
    order: 1,
    id: '148827438',
    unread: true,
    reason: 'author',
    updatedAt: '2017-05-20T17:06:34Z',
    subject: {
      title: 'Improve the UI',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/4' as Link,
      latestCommentUrl:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302885965' as Link,
      type: 'Issue',
      reviews: null,
    },
    repository: mockGitHubRepository,
  },
];

// 2 Notifications
// Hostname : 'github.gitify.io'
// Repository : 'myorg/notifications-test'
const mockEnterpriseOwner: GitifyOwner = {
  login: 'myorg',
  avatarUrl: 'https://github.gitify.io/avatars/u/4?' as Link,
  type: 'Organization',
};

const mockEnterpriseRepository: GitifyRepository = {
  name: 'notifications-test',
  fullName: 'myorg/notifications-test',
  owner: mockEnterpriseOwner,
  htmlUrl: 'https://github.gitify.io/myorg/notifications-test' as Link,
};

export const mockEnterpriseNotifications: GitifyNotification[] = [
  {
    account: mockGitHubEnterpriseServerAccount,
    order: 0,
    id: '3',
    unread: true,
    reason: 'subscribed',
    updatedAt: '2017-05-20T13:02:48Z',
    subject: {
      title: 'Release 0.0.1',
      url: 'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/3' as Link,
      latestCommentUrl:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/3' as Link,
      type: 'Release',
      reviews: null,
    },
    repository: mockEnterpriseRepository,
  },
  {
    account: mockGitHubEnterpriseServerAccount,
    order: 1,
    id: '4',
    unread: true,
    reason: 'subscribed',
    updatedAt: '2017-05-20T15:52:20Z',
    subject: {
      title: 'Bump Version',
      url: 'https://github.gitify.io/api/v3/repos/myorg/notifications-test/pulls/4' as Link,
      latestCommentUrl:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/issues/comments/21' as Link,
      type: 'PullRequest',
      reviews: null,
    },
    repository: mockEnterpriseRepository,
  },
];

export const mockSingleNotification: GitifyNotification =
  mockGitHubNotifications[0];
