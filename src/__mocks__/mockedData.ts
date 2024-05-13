import type {
  AccountNotifications,
  EnterpriseAccount,
  GitifyUser,
} from '../types';
import type {
  Discussion,
  DiscussionAuthor,
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

// 2 Notifications
// Repository : 'gitify-app/notifications-test'
export const mockedGitHubNotifications: Notification[] = [
  {
    hostname: Constants.GITHUB_API_BASE_URL,
    id: '138661096',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T17:51:57Z',
    last_read_at: '2017-05-20T17:06:51Z',
    subject: {
      title: 'I am a robot and this is a test!',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1',
      latest_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448',
      type: 'Issue',
      state: 'open',
      user: {
        login: 'gitify-app',
        html_url: 'https://github.com/gitify-app',
        avatar_url:
          'https://avatars.githubusercontent.com/u/133795385?s=200&v=4',
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
      node_id: 'MDEwOlJlcG9zaXRvcnkzNjAyOTcwNg==',
      name: 'notifications-test',
      full_name: 'gitify-app/notifications-test',
      url: 'https://api.github.com/gitify-app/notifications-test',
      owner: {
        login: 'gitify-app',
        id: 6333409,
        node_id: 'MDQ6VXNlcjYzMzM0MDk=',
        avatar_url:
          'https://avatars.githubusercontent.com/u/133795385?s=200&v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/gitify-app',
        html_url: 'https://github.com/gitify-app',
        followers_url: 'https://api.github.com/users/gitify-app/followers',
        following_url:
          'https://api.github.com/users/gitify-app/following{/other_user}',
        gists_url: 'https://api.github.com/users/gitify-app/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/gitify-app/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/gitify-app/subscriptions',
        organizations_url: 'https://api.github.com/users/gitify-app/orgs',
        repos_url: 'https://api.github.com/users/gitify-app/repos',
        events_url: 'https://api.github.com/users/gitify-app/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/gitify-app/received_events',
        type: 'User',
        site_admin: false,
      },
      private: true,
      description: 'Test Repository',
      fork: false,
      archive_url:
        'https://api.github.com/repos/gitify-app/notifications-test/{archive_format}{/ref}',
      assignees_url:
        'https://api.github.com/repos/gitify-app/notifications-test/assignees{/user}',
      blobs_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/blobs{/sha}',
      branches_url:
        'https://api.github.com/repos/gitify-app/notifications-test/branches{/branch}',
      collaborators_url:
        'https://api.github.com/repos/gitify-app/notifications-test/collaborators{/collaborator}',
      comments_url:
        'https://api.github.com/repos/gitify-app/notifications-test/comments{/number}',
      commits_url:
        'https://api.github.com/repos/gitify-app/notifications-test/commits{/sha}',
      compare_url:
        'https://api.github.com/repos/gitify-app/notifications-test/compare/{base}...{head}',
      contents_url:
        'https://api.github.com/repos/gitify-app/notifications-test/contents/{+path}',
      contributors_url:
        'https://api.github.com/repos/gitify-app/notifications-test/contributors',
      deployments_url:
        'https://api.github.com/repos/gitify-app/notifications-test/deployments',
      downloads_url:
        'https://api.github.com/repos/gitify-app/notifications-test/downloads',
      events_url:
        'https://api.github.com/repos/gitify-app/notifications-test/events',
      forks_url:
        'https://api.github.com/repos/gitify-app/notifications-test/forks',
      git_commits_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/commits{/sha}',
      git_refs_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/refs{/sha}',
      git_tags_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/tags{/sha}',
      hooks_url:
        'https://api.github.com/repos/gitify-app/notifications-test/hooks',
      html_url: 'https://github.com/gitify-app/notifications-test',
      issue_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments{/number}',
      issue_events_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/events{/number}',
      issues_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues{/number}',
      keys_url:
        'https://api.github.com/repos/gitify-app/notifications-test/keys{/key_id}',
      labels_url:
        'https://api.github.com/repos/gitify-app/notifications-test/labels{/name}',
      languages_url:
        'https://api.github.com/repos/gitify-app/notifications-test/languages',
      merges_url:
        'https://api.github.com/repos/gitify-app/notifications-test/merges',
      milestones_url:
        'https://api.github.com/repos/gitify-app/notifications-test/milestones{/number}',
      notifications_url:
        'https://api.github.com/repos/gitify-app/notifications-test/notifications{?since,all,participating}',
      pulls_url:
        'https://api.github.com/repos/gitify-app/notifications-test/pulls{/number}',
      releases_url:
        'https://api.github.com/repos/gitify-app/notifications-test/releases{/id}',
      stargazers_url:
        'https://api.github.com/repos/gitify-app/notifications-test/stargazers',
      statuses_url:
        'https://api.github.com/repos/gitify-app/notifications-test/statuses/{sha}',
      subscribers_url:
        'https://api.github.com/repos/gitify-app/notifications-test/subscribers',
      subscription_url:
        'https://api.github.com/repos/gitify-app/notifications-test/subscription',
      tags_url:
        'https://api.github.com/repos/gitify-app/notifications-test/tags',
      teams_url:
        'https://api.github.com/repos/gitify-app/notifications-test/teams',
      trees_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/trees{/sha}',
    },
    url: 'https://api.github.com/notifications/threads/138661096',
    subscription_url:
      'https://api.github.com/notifications/threads/138661096/subscription',
  },
  {
    hostname: Constants.GITHUB_API_BASE_URL,
    id: '148827438',
    unread: true,
    reason: 'author',
    updated_at: '2017-05-20T17:06:34Z',
    last_read_at: '2017-05-20T16:59:03Z',
    subject: {
      title: 'Improve the UI',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/4',
      latest_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302885965',
      type: 'Issue',
      reviews: null,
    },
    repository: {
      id: 57216596,
      name: 'notifications-test',
      full_name: 'gitify-app/notifications-test',
      owner: {
        login: 'gitify-app',
        id: 6333409,
        avatar_url:
          'https://avatars.githubusercontent.com/u/133795385?s=200&v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/gitify-app',
        html_url: 'https://github.com/gitify-app',
        followers_url: 'https://api.github.com/users/gitify-app/followers',
        following_url:
          'https://api.github.com/users/gitify-app/following{/other_user}',
        gists_url: 'https://api.github.com/users/gitify-app/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/gitify-app/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/gitify-app/subscriptions',
        organizations_url: 'https://api.github.com/users/gitify-app/orgs',
        repos_url: 'https://api.github.com/users/gitify-app/repos',
        events_url: 'https://api.github.com/users/gitify-app/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/gitify-app/received_events',
        type: 'User',
        site_admin: false,
      },
      private: true,
      html_url: 'https://github.com/gitify-app/notifications-test',
      description: null,
      fork: false,
      // Removed the rest of the properties
    } as unknown as Repository,
    url: 'https://api.github.com/notifications/threads/148827438',
    subscription_url:
      'https://api.github.com/notifications/threads/148827438/subscription',
  },
];

// 2 Notifications
// Repository : 'myorg/notifications-test'
export const mockedEnterpriseNotifications: Notification[] = [
  {
    hostname: 'https://github.gitify.io/api/v3',
    id: '3',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T13:02:48Z',
    last_read_at: null,
    subject: {
      title: 'Release 0.0.1',
      url: 'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/3',
      latest_comment_url:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/3',
      type: 'Release',
      reviews: null,
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
  },
  {
    hostname: 'https://github.gitify.io/api/v3',
    id: '4',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T15:52:20Z',
    last_read_at: '2017-05-20T14:20:55Z',
    subject: {
      title: 'Bump Version',
      url: 'https://github.gitify.io/api/v3/repos/myorg/notifications-test/pulls/4',
      latest_comment_url:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/issues/comments/21',
      type: 'PullRequest',
      reviews: null,
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
  },
];

export const mockedSingleNotification: Notification =
  mockedGitHubNotifications[0];

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
    notifications: [mockedSingleNotification],
  },
];

const mockDiscussionAuthor: DiscussionAuthor = {
  login: 'comment-user',
  url: 'https://github.com/comment-user',
  avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
  type: 'User',
};

const mockDiscussionReplier: DiscussionAuthor = {
  login: 'reply-user',
  url: 'https://github.com/reply-user',
  avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
  type: 'User',
};

export const mockDiscussionComments: DiscussionComments = {
  nodes: [
    {
      databaseId: 2258799,
      createdAt: '2022-02-27T01:22:20Z',
      author: mockDiscussionAuthor,
      replies: {
        nodes: [
          {
            databaseId: 2300902,
            createdAt: '2022-03-05T17:43:52Z',
            author: mockDiscussionReplier,
          },
        ],
      },
    },
  ],
  totalCount: 2,
};

export const mockedGraphQLResponse: GraphQLSearch<Discussion> = {
  data: {
    search: {
      nodes: [
        {
          title: '1.16.0',
          isAnswered: false,
          stateReason: 'OPEN',
          url: 'https://github.com/gitify-app/notifications-test/discussions/612',
          author: {
            login: 'discussion-creator',
            url: 'https://github.com/discussion-creator',
            avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
            type: 'User',
          },
          comments: mockDiscussionComments,
        },
      ],
    },
  },
};
