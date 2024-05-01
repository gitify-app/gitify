import { GitMergeIcon, IssueOpenedIcon } from '@primer/octicons-react';
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
    id: '138661096',
    unread: true,
    reason: {
      type: 'subscribed',
      code: 'subscribed',
      description: 'You are subscribed to this thread',
    },
    updated_at: {
      raw: '2017-05-20T17:51:57Z',
      formatted: 'May 20th, 2017',
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
      avatar_url: 'https://avatars0.githubusercontent.com/u/6333409?v=3',
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
    id: '148827438',
    unread: true,
    reason: {
      type: 'author',
      code: 'author',
      description: 'You created this thread',
    },
    updated_at: {
      raw: '2017-05-20T17:06:34Z',
      formatted: 'May 20th, 2017',
    },
    title: 'Improve the UI',
    type: 'Pull Request',
    html_url: 'https://github.com/repos/gitify-app/notifications-test/pulls/4',
    state: 'merged',
    icon: {
      type: GitMergeIcon,
      color: IconColor.PURPLE,
    },
    user: {
      login: 'mockUser',
      html_url: 'https://github.com/mockUser',
      avatar_url: 'https://avatars0.githubusercontent.com/u/6333409?v=3',
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

// TODO - Update the mock data to be accurate
export const mockedEnterpriseNotifications: GitifyNotification[] = [
  {
    hostname: Constants.GITHUB_API_BASE_URL,
    id: '138661096',
    unread: true,
    reason: {
      type: 'subscribed',
      code: 'subscribed',
      description: 'You are subscribed to this thread',
    },
    updated_at: {
      raw: '2017-05-20T17:51:57Z',
      formatted: 'May 20th, 2017',
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
      avatar_url: 'https://avatars0.githubusercontent.com/u/6333409?v=3',
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
    id: '148827438',
    unread: true,
    reason: {
      type: 'author',
      code: 'author',
      description: 'You created this thread',
    },
    updated_at: {
      raw: '2017-05-20T17:06:34Z',
      formatted: 'May 20th, 2017',
    },
    title: 'Improve the UI',
    type: 'Pull Request',
    html_url: 'https://github.com/repos/gitify-app/notifications-test/pulls/4',
    state: 'merged',
    icon: {
      type: GitMergeIcon,
      color: IconColor.PURPLE,
    },
    user: {
      login: 'mockUser',
      html_url: 'https://github.com/mockUser',
      avatar_url: 'https://avatars0.githubusercontent.com/u/6333409?v=3',
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
