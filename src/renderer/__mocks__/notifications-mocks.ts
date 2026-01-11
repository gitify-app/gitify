import {
  FeedPullRequestOpenIcon,
  IssueOpenedIcon,
} from '@primer/octicons-react';

import {
  type AccountNotifications,
  type GitifyNotification,
  type GitifyNotificationUser,
  type GitifyOwner,
  type GitifyReason,
  type GitifyRepository,
  type GitifySubject,
  IconColor,
  type Link,
} from '../types';
import {
  mockGitHubAppAccount,
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from './account-mocks';

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

/**
 * Mock Gitify Notifications for GitHub Cloud account
 *
 * 2 Notifications
 * Hostname: 'github.com'
 * Repository: 'gitify-app/notifications-test'
 */
export const mockGitHubCloudGitifyNotifications: GitifyNotification[] = [
  {
    account: mockGitHubCloudAccount,
    order: 0,
    id: '138661096',
    unread: true,
    reason: {
      code: 'subscribed',
      title: 'Updated',
      description: "You're watching the repository.",
    },
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
    display: {
      number: '123',
      title: 'I am a robot and this is a test! [#123]',
      type: 'Open Issue',
      icon: {
        type: IssueOpenedIcon,
        color: IconColor.GREEN,
      },
      defaultUserType: 'User',
    },
  },
  {
    account: mockGitHubCloudAccount,
    order: 1,
    id: '148827438',
    unread: true,
    reason: {
      code: 'author',
      title: 'Authored',
      description: 'You created the thread.',
    },
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
    display: {
      number: '456',
      title: 'Improve the UI [#456]',
      type: 'Issue',
      icon: {
        type: IssueOpenedIcon,
        color: IconColor.GREEN,
      },
      defaultUserType: 'User',
    },
  },
];

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

/**
 * Mock Gitify Notifications for GitHub Enterprise account
 *
 * 2 Notifications
 * Hostname: 'github.gitify.io'
 * Repository: 'myorg/notifications-test'
 */
export const mockGithubEnterpriseGitifyNotifications: GitifyNotification[] = [
  {
    account: mockGitHubEnterpriseServerAccount,
    order: 0,
    id: '3',
    unread: true,
    reason: {
      code: 'subscribed',
      title: 'Updated',
      description: "You're watching the repository.",
    },
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
    display: {
      number: '',
      title: 'Release 0.0.1',
      type: 'Release',
      icon: {
        type: IssueOpenedIcon,
        color: IconColor.GREEN,
      },
      defaultUserType: 'User',
    },
  },
  {
    account: mockGitHubEnterpriseServerAccount,
    order: 1,
    id: '4',
    unread: true,
    reason: {
      code: 'subscribed',
      title: 'Updated',
      description: "You're watching the repository.",
    },
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
    display: {
      number: '123',
      title: 'Bump Version [#123]',
      type: 'Pull Request',
      icon: {
        type: FeedPullRequestOpenIcon,
        color: IconColor.GREEN,
      },
      defaultUserType: 'User',
    },
  },
];

export const mockGitifyNotification: GitifyNotification =
  mockGitHubCloudGitifyNotifications[0];

export const mockMultipleAccountNotifications: AccountNotifications[] = [
  {
    account: mockGitHubCloudAccount,
    notifications: mockGitHubCloudGitifyNotifications,
    error: null,
  },
  {
    account: mockGitHubEnterpriseServerAccount,
    notifications: mockGithubEnterpriseGitifyNotifications,
    error: null,
  },
];

export const mockSingleAccountNotifications: AccountNotifications[] = [
  {
    account: mockGitHubCloudAccount,
    notifications: [mockGitifyNotification],
    error: null,
  },
];

export function mockPartialGitifyNotification(
  subject: Partial<GitifySubject>,
  repository?: Partial<GitifyRepository>,
): GitifyNotification {
  const mockNotification: Partial<GitifyNotification> = {
    account: mockGitHubAppAccount,
    reason: {
      code: 'subscribed',
      title: 'Updated',
      description: "You're watching the repository.",
    } as GitifyReason,
    updatedAt: '2026-01-01T17:00:00Z',
    subject: subject as GitifySubject,
    repository: {
      name: 'notifications-test',
      fullName: 'gitify-app/notifications-test',
      htmlUrl: 'https://github.com/gitify-app/notifications-test' as Link,
      owner: {
        login: 'gitify-app',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1' as Link,
        type: 'Organization',
      },
      ...repository,
    } as GitifyRepository,
  };

  return mockNotification as GitifyNotification;
}

export function mockGitifyNotificationForRepoName(
  id: string,
  repoFullName: string | null,
): GitifyNotification {
  return {
    id,
    repository: repoFullName ? { fullName: repoFullName } : null,
    account: mockGitHubCloudAccount,
  } as GitifyNotification;
}
