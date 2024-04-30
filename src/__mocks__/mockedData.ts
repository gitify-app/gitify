import { IssueOpenedIcon } from '@primer/octicons-react';
import {
  type AccountNotifications,
  type EnterpriseAccount,
  type GitifyNotification,
  type GitifyUser,
  IconColor,
} from '../types';
import type {
  Discussion,
  DiscussionComments,
  GraphQLSearch,
  Notification,
  Repository,
  User,
} from '../typesGitHub';
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

export const mockedNotificationUser: User = {
  login: 'octocat',
  id: 123456789,
  node_id: 'MDQ6VXNlcjE=',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
  gravatar_url: '',
  url: 'https://api.github.com/users/octocat',
  html_url: 'https://github.com/octocat',
  followers_url: 'https://api.github.com/users/octocat/followers',
  following_url: 'https://api.github.com/users/octocat/following{/other_user}',
  gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/octocat/subscriptions',
  organizations_url: 'https://api.github.com/users/octocat/orgs',
  repos_url: 'https://api.github.com/users/octocat/repos',
  events_url: 'https://api.github.com/users/octocat/events{/privacy}',
  received_events_url: 'https://api.github.com/users/octocat/received_events',
  type: 'User',
  site_admin: false,
};

export const mockedCommenterUser: User = {
  login: 'dummyuser',
  id: 987654321,
  node_id: 'MDQ6VXNlcjI=',
  avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
  gravatar_url: '',
  url: 'https://api.github.com/users/dummyuser',
  html_url: 'https://github.com/dummyuser',
  followers_url: 'https://api.github.com/users/dummyuser/followers',
  following_url:
    'https://api.github.com/users/dummyuser/following{/other_user}',
  gists_url: 'https://api.github.com/users/dummyuser/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/dummyuser/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/dummyuser/subscriptions',
  organizations_url: 'https://api.github.com/users/dummyuser/orgs',
  repos_url: 'https://api.github.com/users/dummyuser/repos',
  events_url: 'https://api.github.com/users/dummyuser/events{/privacy}',
  received_events_url: 'https://api.github.com/users/dummyuser/received_events',
  type: 'User',
  site_admin: false,
};

export const mockGitifyNotification: GitifyNotification = {
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
  url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1',
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
  },
};

export const mockedSingleNotification: Notification = {
  hostname: Constants.GITHUB_API_BASE_URL,
  id: '138661096',
  unread: true,
  reason: 'subscribed',
  updated_at: '2017-05-20T17:51:57Z',
  last_read_at: '2017-05-20T17:06:51Z',
  subject: {
    title: 'I am a robot and this is a test!',
    url: 'https://api.github.com/repos/manosim/notifications-test/issues/1',
    latest_comment_url:
      'https://api.github.com/repos/manosim/notifications-test/issues/comments/302888448',
    type: 'Issue',
    state: 'open',
    user: {
      login: 'manosim',
      html_url: 'https://github.com/manosim',
      avatar_url: 'https://avatars0.githubusercontent.com/u/6333409?v=3',
      type: 'User',
    },
  },
  repository: {
    id: 57216596,
    node_id: 'MDEwOlJlcG9zaXRvcnkzNjAyOTcwNg==',
    name: 'notifications-test',
    full_name: 'manosim/notifications-test',
    url: 'https://api.github.com/manosim/notifications-test',
    owner: {
      login: 'manosim',
      id: 6333409,
      node_id: 'MDQ6VXNlcjYzMzM0MDk=',
      avatar_url: 'https://avatars0.githubusercontent.com/u/6333409?v=3',
      gravatar_id: '',
      url: 'https://api.github.com/users/manosim',
      html_url: 'https://github.com/manosim',
      followers_url: 'https://api.github.com/users/manosim/followers',
      following_url:
        'https://api.github.com/users/manosim/following{/other_user}',
      gists_url: 'https://api.github.com/users/manosim/gists{/gist_id}',
      starred_url:
        'https://api.github.com/users/manosim/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/manosim/subscriptions',
      organizations_url: 'https://api.github.com/users/manosim/orgs',
      repos_url: 'https://api.github.com/users/manosim/repos',
      events_url: 'https://api.github.com/users/manosim/events{/privacy}',
      received_events_url:
        'https://api.github.com/users/manosim/received_events',
      type: 'User',
      site_admin: false,
    },
    private: true,
    description: 'Test Repository',
    fork: false,
    archive_url:
      'https://api.github.com/repos/manosim/notifications-test/{archive_format}{/ref}',
    assignees_url:
      'https://api.github.com/repos/manosim/notifications-test/assignees{/user}',
    blobs_url:
      'https://api.github.com/repos/manosim/notifications-test/git/blobs{/sha}',
    branches_url:
      'https://api.github.com/repos/manosim/notifications-test/branches{/branch}',
    collaborators_url:
      'https://api.github.com/repos/manosim/notifications-test/collaborators{/collaborator}',
    comments_url:
      'https://api.github.com/repos/manosim/notifications-test/comments{/number}',
    commits_url:
      'https://api.github.com/repos/manosim/notifications-test/commits{/sha}',
    compare_url:
      'https://api.github.com/repos/manosim/notifications-test/compare/{base}...{head}',
    contents_url:
      'https://api.github.com/repos/manosim/notifications-test/contents/{+path}',
    contributors_url:
      'https://api.github.com/repos/manosim/notifications-test/contributors',
    deployments_url:
      'https://api.github.com/repos/manosim/notifications-test/deployments',
    downloads_url:
      'https://api.github.com/repos/manosim/notifications-test/downloads',
    events_url:
      'https://api.github.com/repos/manosim/notifications-test/events',
    forks_url: 'https://api.github.com/repos/manosim/notifications-test/forks',
    git_commits_url:
      'https://api.github.com/repos/manosim/notifications-test/git/commits{/sha}',
    git_refs_url:
      'https://api.github.com/repos/manosim/notifications-test/git/refs{/sha}',
    git_tags_url:
      'https://api.github.com/repos/manosim/notifications-test/git/tags{/sha}',
    hooks_url: 'https://api.github.com/repos/manosim/notifications-test/hooks',
    html_url: 'https://github.com/manosim/notifications-test',
    issue_comment_url:
      'https://api.github.com/repos/manosim/notifications-test/issues/comments{/number}',
    issue_events_url:
      'https://api.github.com/repos/manosim/notifications-test/issues/events{/number}',
    issues_url:
      'https://api.github.com/repos/manosim/notifications-test/issues{/number}',
    keys_url:
      'https://api.github.com/repos/manosim/notifications-test/keys{/key_id}',
    labels_url:
      'https://api.github.com/repos/manosim/notifications-test/labels{/name}',
    languages_url:
      'https://api.github.com/repos/manosim/notifications-test/languages',
    merges_url:
      'https://api.github.com/repos/manosim/notifications-test/merges',
    milestones_url:
      'https://api.github.com/repos/manosim/notifications-test/milestones{/number}',
    notifications_url:
      'https://api.github.com/repos/manosim/notifications-test/notifications{?since,all,participating}',
    pulls_url:
      'https://api.github.com/repos/manosim/notifications-test/pulls{/number}',
    releases_url:
      'https://api.github.com/repos/manosim/notifications-test/releases{/id}',
    stargazers_url:
      'https://api.github.com/repos/manosim/notifications-test/stargazers',
    statuses_url:
      'https://api.github.com/repos/manosim/notifications-test/statuses/{sha}',
    subscribers_url:
      'https://api.github.com/repos/manosim/notifications-test/subscribers',
    subscription_url:
      'https://api.github.com/repos/manosim/notifications-test/subscription',
    tags_url: 'https://api.github.com/repos/manosim/notifications-test/tags',
    teams_url: 'https://api.github.com/repos/manosim/notifications-test/teams',
    trees_url:
      'https://api.github.com/repos/manosim/notifications-test/git/trees{/sha}',
  },
  url: 'https://api.github.com/notifications/threads/138661096',
  subscription_url:
    'https://api.github.com/notifications/threads/138661096/subscription',
};

// 2 Notifications
// Repository : 'manosim/notifications-tests'
export const mockedGitHubNotifications = [
  mockedSingleNotification,
  {
    id: '148827438',
    unread: true,
    reason: 'author',
    updated_at: '2017-05-20T17:06:34Z',
    last_read_at: '2017-05-20T16:59:03Z',
    subject: {
      title: 'Improve the UI',
      url: 'https://api.github.com/repos/manosim/notifications-test/issues/4',
      latest_comment_url:
        'https://api.github.com/repos/manosim/notifications-test/issues/comments/302885965',
      type: 'Issue',
    },
    repository: {
      id: 57216596,
      name: 'notifications-test',
      full_name: 'manosim/notifications-test',
      owner: {
        login: 'manosim',
        id: 6333409,
        avatar_url: 'https://avatars0.githubusercontent.com/u/6333409?v=3',
        gravatar_id: '',
        url: 'https://api.github.com/users/manosim',
        html_url: 'https://github.com/manosim',
        followers_url: 'https://api.github.com/users/manosim/followers',
        following_url:
          'https://api.github.com/users/manosim/following{/other_user}',
        gists_url: 'https://api.github.com/users/manosim/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/manosim/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/manosim/subscriptions',
        organizations_url: 'https://api.github.com/users/manosim/orgs',
        repos_url: 'https://api.github.com/users/manosim/repos',
        events_url: 'https://api.github.com/users/manosim/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/manosim/received_events',
        type: 'User',
        site_admin: false,
      },
      private: true,
      html_url: 'https://github.com/manosim/notifications-test',
      description: null,
      fork: false,
      // Removed the rest of the properties
    } as unknown as Repository,
    url: 'https://api.github.com/notifications/threads/148827438',
    subscription_url:
      'https://api.github.com/notifications/threads/148827438/subscription',
    hostname: Constants.GITHUB_API_BASE_URL,
  } as Notification,
];

// 2 Notifications
// Repository : 'myorg/notifications-test'
export const mockedEnterpriseNotifications = [
  {
    id: '4',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T13:02:48Z',
    last_read_at: null,
    subject: {
      title: 'Release 0.0.1',
      url: 'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/1',
      latest_comment_url:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/1',
      type: 'Release',
    },
    repository: {
      id: 1,
      name: 'notifications-test',
      full_name: 'myorg/notifications-test',
      owner: {
        login: 'myorg',
        id: 4,
        avatar_url: 'https://github.gitify.io/avatars/u/4?',
        gravatar_id: '',
        url: 'https://github.gitify.io/api/v3/users/myorg',
        html_url: 'https://github.gitify.io/myorg',
        followers_url: 'https://github.gitify.io/api/v3/users/myorg/followers',
        following_url:
          'https://github.gitify.io/api/v3/users/myorg/following{/other_user}',
        gists_url:
          'https://github.gitify.io/api/v3/users/myorg/gists{/gist_id}',
        starred_url:
          'https://github.gitify.io/api/v3/users/myorg/starred{/owner}{/repo}',
        subscriptions_url:
          'https://github.gitify.io/api/v3/users/myorg/subscriptions',
        organizations_url: 'https://github.gitify.io/api/v3/users/myorg/orgs',
        repos_url: 'https://github.gitify.io/api/v3/users/myorg/repos',
        events_url:
          'https://github.gitify.io/api/v3/users/myorg/events{/privacy}',
        received_events_url:
          'https://github.gitify.io/api/v3/users/myorg/received_events',
        type: 'Organization',
        site_admin: false,
      },
      private: true,
      html_url: 'https://github.gitify.io/myorg/notifications-test',
      description: null,
      fork: false,
      // Removed the rest of the properties
    } as unknown as Repository,
    url: 'https://github.gitify.io/api/v3/notifications/threads/4',
    subscription_url:
      'https://github.gitify.io/api/v3/notifications/threads/4/subscription',
  } as Notification,
  {
    id: '3',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T15:52:20Z',
    last_read_at: '2017-05-20T14:20:55Z',
    subject: {
      title: 'Bump Version',
      url: 'https://github.gitify.io/api/v3/repos/myorg/notifications-test/pulls/3',
      latest_comment_url:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/issues/comments/21',
      type: 'PullRequest',
    },
    repository: {
      id: 1,
      name: 'notifications-test',
      full_name: 'myorg/notifications-test',
      owner: {
        login: 'myorg',
        id: 4,
        avatar_url: 'https://github.gitify.io/avatars/u/4?',
        gravatar_id: '',
        url: 'https://github.gitify.io/api/v3/users/myorg',
        html_url: 'https://github.gitify.io/myorg',
        followers_url: 'https://github.gitify.io/api/v3/users/myorg/followers',
        following_url:
          'https://github.gitify.io/api/v3/users/myorg/following{/other_user}',
        gists_url:
          'https://github.gitify.io/api/v3/users/myorg/gists{/gist_id}',
        starred_url:
          'https://github.gitify.io/api/v3/users/myorg/starred{/owner}{/repo}',
        subscriptions_url:
          'https://github.gitify.io/api/v3/users/myorg/subscriptions',
        organizations_url: 'https://github.gitify.io/api/v3/users/myorg/orgs',
        repos_url: 'https://github.gitify.io/api/v3/users/myorg/repos',
        events_url:
          'https://github.gitify.io/api/v3/users/myorg/events{/privacy}',
        received_events_url:
          'https://github.gitify.io/api/v3/users/myorg/received_events',
        type: 'Organization',
        site_admin: false,
      },
      private: true,
      html_url: 'https://github.gitify.io/myorg/notifications-test',
      description: null,
      fork: false,
      // Removed the rest of the properties
    } as unknown as Repository,
    url: 'https://github.gitify.io/api/v3/notifications/threads/3',
    subscription_url:
      'https://github.gitify.io/api/v3/notifications/threads/3/subscription',
    hostname: Constants.GITHUB_API_BASE_URL,
  } as Notification,
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

export const mockedSingleAccountNotifications: AccountNotifications[] = [
  {
    hostname: 'github.com',
    notifications: [mockGitifyNotification],
  },
];

const mockDiscussionComments: DiscussionComments = {
  nodes: [
    {
      databaseId: 2215656,
      createdAt: '2022-02-20T18:33:39Z',
      author: {
        login: 'comment-user',
        url: 'https://github.com/comment-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
        type: 'User',
      },
      replies: {
        nodes: [],
      },
    },
    {
      databaseId: 2217789,
      createdAt: '2022-02-21T03:30:42Z',
      author: {
        login: 'comment-user',
        url: 'https://github.com/comment-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
        type: 'User',
      },
      replies: {
        nodes: [],
      },
    },
    {
      databaseId: 2223243,
      createdAt: '2022-02-21T18:26:27Z',
      author: {
        login: 'comment-user',
        url: 'https://github.com/comment-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
        type: 'User',
      },
      replies: {
        nodes: [
          {
            databaseId: 2232922,
            createdAt: '2022-02-23T00:57:58Z',
            author: {
              login: 'reply-user',
              url: 'https://github.com/reply-user',
              avatar_url:
                'https://avatars.githubusercontent.com/u/123456789?v=4',
              type: 'User',
            },
          },
        ],
      },
    },
    {
      databaseId: 2232921,
      createdAt: '2022-02-23T00:57:49Z',
      author: {
        login: 'comment-user',
        url: 'https://github.com/comment-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
        type: 'User',
      },
      replies: {
        nodes: [],
      },
    },
    {
      databaseId: 2258799,
      createdAt: '2022-02-27T01:22:20Z',
      author: {
        login: 'comment-user',
        url: 'https://github.com/comment-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
        type: 'User',
      },
      replies: {
        nodes: [
          {
            databaseId: 2300902,
            createdAt: '2022-03-05T17:43:52Z',
            author: {
              login: 'reply-user',
              url: 'https://github.com/reply-user',
              avatar_url:
                'https://avatars.githubusercontent.com/u/123456789?v=4',
              type: 'User',
            },
          },
        ],
      },
    },
    {
      databaseId: 2297637,
      createdAt: '2022-03-04T20:39:44Z',
      author: {
        login: 'comment-user',
        url: 'https://github.com/comment-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
        type: 'User',
      },

      replies: {
        nodes: [
          {
            databaseId: 2300893,
            createdAt: '2022-03-05T17:41:04Z',
            author: {
              login: 'reply-user',
              url: 'https://github.com/reply-user',
              avatar_url:
                'https://avatars.githubusercontent.com/u/123456789?v=4',
              type: 'User',
            },
          },
        ],
      },
    },
    {
      databaseId: 2299763,
      createdAt: '2022-03-05T11:05:42Z',
      author: {
        login: 'comment-user',
        url: 'https://github.com/comment-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
        type: 'User',
      },
      replies: {
        nodes: [
          {
            databaseId: 2300895,
            createdAt: '2022-03-05T17:41:44Z',
            author: {
              login: 'reply-user',
              url: 'https://github.com/reply-user',
              avatar_url:
                'https://avatars.githubusercontent.com/u/123456789?v=4',
              type: 'User',
            },
          },
        ],
      },
    },
  ],
};

export const mockedGraphQLResponse: GraphQLSearch<Discussion> = {
  data: {
    data: {
      search: {
        nodes: [
          {
            viewerSubscription: 'SUBSCRIBED',
            title: '1.16.0',
            isAnswered: false,
            stateReason: 'OPEN',
            url: 'https://github.com/manosim/notifications-test/discussions/612',
            author: {
              login: 'discussion-creator',
              url: 'https://github.com/discussion-creator',
              avatar_url:
                'https://avatars.githubusercontent.com/u/123456789?v=4',
              type: 'User',
            },
            comments: mockDiscussionComments,
          },
          {
            viewerSubscription: 'IGNORED',
            title: '1.16.0',
            isAnswered: false,
            stateReason: 'ANSWERED',
            url: 'https://github.com/manosim/notifications-test/discussions/123',
            author: {
              login: 'discussion-creator',
              url: 'https://github.com/discussion-creator',
              avatar_url:
                'https://avatars.githubusercontent.com/u/123456789?v=4',
              type: 'User',
            },
            comments: mockDiscussionComments,
          },
        ],
      },
    },
  },
};
