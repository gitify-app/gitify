import {
  GitMergeIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  TagIcon,
} from '@primer/octicons-react';
import {
  type AccountNotifications,
  type EnterpriseAccount,
  type GitifyNotification,
  type GitifyUser,
  IconColor,
} from '../types';
import Constants from '../utils/constants';

export const mockedEnterpriseAccounts: EnterpriseAccount[] = [
  {
    hostname: 'github.gitify.io',
    token: '1234568790',
  },
];

export const mockedUser: GitifyUser = {
  login: 'octocat',
  name: 'Mona Lisa Octocat',
  id: 123456789,
};

export const mockedGitHubNotifications: GitifyNotification[] = [
  {
    hostname: Constants.GITHUB_API_BASE_URL,
    id: '1',
    unread: true,
    reason: {
      type: 'subscribed',
      code: 'subscribed',
      description: 'You are subscribed to this thread',
    },
    updated_at: {
      raw: '2024-05-01T10:00:00Z',
      formatted: 'May 1st, 2024',
    },
    title: 'I am a robot and this is a test!',
    html_url:
      'https://api.github.com/repos/gitify-app/notifications-test/issues/1',
    type: 'Issue',
    state: 'open',
    icon: {
      type: IssueOpenedIcon,
      color: IconColor.GREEN,
    },
    user: {
      login: 'mockUser',
      html_url: 'https://github.com/mockUser',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      type: 'User',
    },
    repository: {
      full_name: 'gitify-app/notifications-test',
      avatar_url: 'https://avatars.githubusercontent.com/u/133795385?s=200&v=4',
      html_url: 'https://github.com/gitify-app/notifications-test',
      owner: {
        avatar_url:
          'https://avatars.githubusercontent.com/u/133795385?s=200&v=4',
      },
    },
  },
  {
    hostname: Constants.GITHUB_API_BASE_URL,
    id: '2',
    unread: true,
    reason: {
      type: 'author',
      code: 'author',
      description: 'You created this thread',
    },
    updated_at: {
      raw: '2024-05-01T10:00:00Z',
      formatted: 'May 1st, 2024',
    },
    title: 'Improve the UI',
    type: 'Pull Request',
    html_url: 'https://github.com/repos/gitify-app/notifications-test/pulls/2',
    state: 'merged',
    icon: {
      type: GitMergeIcon,
      color: IconColor.PURPLE,
    },
    user: {
      login: 'mockUser',
      html_url: 'https://github.com/mockUser',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      type: 'User',
    },
    repository: {
      full_name: 'gitify-app/notifications-test',
      avatar_url: 'https://avatars.githubusercontent.com/u/133795385?s=200&v=4',
      html_url: 'https://github.com/gitify-app/notifications-test',
      owner: {
        avatar_url:
          'https://avatars.githubusercontent.com/u/133795385?s=200&v=4',
      },
    },
  },
];

export const mockedEnterpriseNotifications: GitifyNotification[] = [
  {
    hostname: 'https://github.gitify.io/api/v3',
    id: '3',
    unread: true,
    reason: {
      type: 'subscribed',
      code: 'subscribed',
      description: 'You are subscribed to this thread',
    },
    updated_at: {
      raw: '2024-05-01T10:00:00Z',
      formatted: 'May 1st, 2024',
    },
    title: 'Release 0.0.1',
    html_url:
      'https://github.gitify.io/repos/myorg/notifications-test/releases/3',
    type: 'Release',
    state: null,
    icon: {
      type: TagIcon,
      color: IconColor.GRAY,
    },
    user: {
      login: 'mockUser',
      html_url: 'https://github.com/mockUser',
      avatar_url: 'https://avatars0.githubusercontent.com/u/6333409?v=3',
      type: 'User',
    },
    repository: {
      full_name: 'myorg/notifications-test',
      avatar_url: 'https://github.gitify.io/avatars/u/4?',
      html_url: 'https://github.gitify.io/myorg/notifications-test',
      owner: {
        avatar_url: 'https://github.gitify.io/avatars/u/4?',
      },
    },
  },
  {
    hostname: 'https://github.gitify.io/api/v3',
    id: '4',
    unread: true,
    reason: {
      type: 'subscribed',
      code: 'subscribed',
      description: 'You are subscribed to this thread',
    },
    updated_at: {
      raw: '2024-05-01T10:00:00Z',
      formatted: 'May 1st, 2024',
    },
    title: 'Bump version',
    html_url: 'https://github.gitify.io/repos/myorg/notifications-test/pulls/4',
    type: 'PullRequest',
    state: 'open',
    icon: {
      type: GitPullRequestIcon,
      color: IconColor.GREEN,
    },
    user: {
      login: 'mockUser',
      html_url: 'https://github.com/mockUser',
      avatar_url: 'https://avatars0.githubusercontent.com/u/6333409?v=3',
      type: 'User',
    },
    repository: {
      full_name: 'myorg/notifications-test',
      avatar_url: 'https://github.gitify.io/avatars/u/4?',
      html_url: 'https://github.gitify.io/myorg/notifications-test',
      owner: {
        avatar_url: 'https://github.gitify.io/avatars/u/4?',
      },
    },
  },
];

export const mockedSingleNotification: GitifyNotification =
  mockedGitHubNotifications[0];

export const mockedSingleAccountNotifications: AccountNotifications[] = [
  {
    hostname: 'github.com',
    notifications: [mockedSingleNotification],
  },
];

export const mockedAccountNotifications: AccountNotifications[] = [
  {
    hostname: 'github.com',
    notifications: mockedGitHubNotifications,
  },
  {
    hostname: 'github.gitify.io',
    notifications: mockedEnterpriseNotifications,
  },
];
