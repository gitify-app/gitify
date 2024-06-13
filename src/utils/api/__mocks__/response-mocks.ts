import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../../__mocks__/state-mocks';
import type { WebUrl } from '../../../types';
import type {
  Discussion,
  DiscussionAuthor,
  DiscussionComments,
  DiscussionLabels,
  GraphQLSearch,
  Notification,
  Repository,
  User,
} from '../../../typesGitHub';

export const mockNotificationUser: User = {
  login: 'octocat',
  id: 123456789,
  node_id: 'MDQ6VXNlcjE=',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4' as WebUrl,
  gravatar_url: '' as WebUrl,
  url: 'https://api.github.com/users/octocat' as WebUrl,
  html_url: 'https://github.com/octocat' as WebUrl,
  followers_url: 'https://api.github.com/users/octocat/followers' as WebUrl,
  following_url:
    'https://api.github.com/users/octocat/following{/other_user}' as WebUrl,
  gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}' as WebUrl,
  starred_url:
    'https://api.github.com/users/octocat/starred{/owner}{/repo}' as WebUrl,
  subscriptions_url:
    'https://api.github.com/users/octocat/subscriptions' as WebUrl,
  organizations_url: 'https://api.github.com/users/octocat/orgs' as WebUrl,
  repos_url: 'https://api.github.com/users/octocat/repos' as WebUrl,
  events_url: 'https://api.github.com/users/octocat/events{/privacy}' as WebUrl,
  received_events_url:
    'https://api.github.com/users/octocat/received_events' as WebUrl,
  type: 'User',
  site_admin: false,
};

// 2 Notifications
// Hostname : 'github.com'
// Repository : 'gitify-app/notifications-test'
export const mockGitHubNotifications: Notification[] = [
  {
    account: mockGitHubCloudAccount,
    id: '138661096',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T17:51:57Z',
    last_read_at: '2017-05-20T17:06:51Z',
    subject: {
      title: 'I am a robot and this is a test!',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as WebUrl,
      latest_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as WebUrl,
      type: 'Issue',
      state: 'open',
      user: {
        login: 'gitify-app',
        html_url: 'https://github.com/gitify-app' as WebUrl,
        avatar_url:
          'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as WebUrl,
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
      url: 'https://api.github.com/gitify-app/notifications-test' as WebUrl,
      owner: {
        login: 'gitify-app',
        id: 6333409,
        node_id: 'MDQ6VXNlcjYzMzM0MDk=',
        avatar_url:
          'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as WebUrl,
        gravatar_id: '',
        url: 'https://api.github.com/users/gitify-app' as WebUrl,
        html_url: 'https://github.com/gitify-app' as WebUrl,
        followers_url:
          'https://api.github.com/users/gitify-app/followers' as WebUrl,
        following_url:
          'https://api.github.com/users/gitify-app/following{/other_user}' as WebUrl,
        gists_url:
          'https://api.github.com/users/gitify-app/gists{/gist_id}' as WebUrl,
        starred_url:
          'https://api.github.com/users/gitify-app/starred{/owner}{/repo}' as WebUrl,
        subscriptions_url:
          'https://api.github.com/users/gitify-app/subscriptions' as WebUrl,
        organizations_url:
          'https://api.github.com/users/gitify-app/orgs' as WebUrl,
        repos_url: 'https://api.github.com/users/gitify-app/repos' as WebUrl,
        events_url:
          'https://api.github.com/users/gitify-app/events{/privacy}' as WebUrl,
        received_events_url:
          'https://api.github.com/users/gitify-app/received_events' as WebUrl,
        type: 'User',
        site_admin: false,
      },
      private: true,
      description: 'Test Repository',
      fork: false,
      archive_url:
        'https://api.github.com/repos/gitify-app/notifications-test/{archive_format}{/ref}' as WebUrl,
      assignees_url:
        'https://api.github.com/repos/gitify-app/notifications-test/assignees{/user}' as WebUrl,
      blobs_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/blobs{/sha}' as WebUrl,
      branches_url:
        'https://api.github.com/repos/gitify-app/notifications-test/branches{/branch}' as WebUrl,
      collaborators_url:
        'https://api.github.com/repos/gitify-app/notifications-test/collaborators{/collaborator}' as WebUrl,
      comments_url:
        'https://api.github.com/repos/gitify-app/notifications-test/comments{/number}' as WebUrl,
      commits_url:
        'https://api.github.com/repos/gitify-app/notifications-test/commits{/sha}' as WebUrl,
      compare_url:
        'https://api.github.com/repos/gitify-app/notifications-test/compare/{base}...{head}' as WebUrl,
      contents_url:
        'https://api.github.com/repos/gitify-app/notifications-test/contents/{+path}' as WebUrl,
      contributors_url:
        'https://api.github.com/repos/gitify-app/notifications-test/contributors' as WebUrl,
      deployments_url:
        'https://api.github.com/repos/gitify-app/notifications-test/deployments' as WebUrl,
      downloads_url:
        'https://api.github.com/repos/gitify-app/notifications-test/downloads' as WebUrl,
      events_url:
        'https://api.github.com/repos/gitify-app/notifications-test/events' as WebUrl,
      forks_url:
        'https://api.github.com/repos/gitify-app/notifications-test/forks' as WebUrl,
      git_commits_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/commits{/sha}' as WebUrl,
      git_refs_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/refs{/sha}' as WebUrl,
      git_tags_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/tags{/sha}' as WebUrl,
      hooks_url:
        'https://api.github.com/repos/gitify-app/notifications-test/hooks' as WebUrl,
      html_url: 'https://github.com/gitify-app/notifications-test' as WebUrl,
      issue_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments{/number}' as WebUrl,
      issue_events_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/events{/number}' as WebUrl,
      issues_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues{/number}' as WebUrl,
      keys_url:
        'https://api.github.com/repos/gitify-app/notifications-test/keys{/key_id}' as WebUrl,
      labels_url:
        'https://api.github.com/repos/gitify-app/notifications-test/labels{/name}' as WebUrl,
      languages_url:
        'https://api.github.com/repos/gitify-app/notifications-test/languages' as WebUrl,
      merges_url:
        'https://api.github.com/repos/gitify-app/notifications-test/merges' as WebUrl,
      milestones_url:
        'https://api.github.com/repos/gitify-app/notifications-test/milestones{/number}' as WebUrl,
      notifications_url:
        'https://api.github.com/repos/gitify-app/notifications-test/notifications{?since,all,participating}' as WebUrl,
      pulls_url:
        'https://api.github.com/repos/gitify-app/notifications-test/pulls{/number}' as WebUrl,
      releases_url:
        'https://api.github.com/repos/gitify-app/notifications-test/releases{/id}' as WebUrl,
      stargazers_url:
        'https://api.github.com/repos/gitify-app/notifications-test/stargazers' as WebUrl,
      statuses_url:
        'https://api.github.com/repos/gitify-app/notifications-test/statuses/{sha}' as WebUrl,
      subscribers_url:
        'https://api.github.com/repos/gitify-app/notifications-test/subscribers' as WebUrl,
      subscription_url:
        'https://api.github.com/repos/gitify-app/notifications-test/subscription' as WebUrl,
      tags_url:
        'https://api.github.com/repos/gitify-app/notifications-test/tags' as WebUrl,
      teams_url:
        'https://api.github.com/repos/gitify-app/notifications-test/teams' as WebUrl,
      trees_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/trees{/sha}' as WebUrl,
    },
    url: 'https://api.github.com/notifications/threads/138661096' as WebUrl,
    subscription_url:
      'https://api.github.com/notifications/threads/138661096/subscription' as WebUrl,
  },
  {
    account: mockGitHubCloudAccount,
    id: '148827438',
    unread: true,
    reason: 'author',
    updated_at: '2017-05-20T17:06:34Z',
    last_read_at: '2017-05-20T16:59:03Z',
    subject: {
      title: 'Improve the UI',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/4' as WebUrl,
      latest_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302885965' as WebUrl,
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
          'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as WebUrl,
        gravatar_id: '',
        url: 'https://api.github.com/users/gitify-app' as WebUrl,
        html_url: 'https://github.com/gitify-app' as WebUrl,
        followers_url:
          'https://api.github.com/users/gitify-app/followers' as WebUrl,
        following_url:
          'https://api.github.com/users/gitify-app/following{/other_user}' as WebUrl,
        gists_url:
          'https://api.github.com/users/gitify-app/gists{/gist_id}' as WebUrl,
        starred_url:
          'https://api.github.com/users/gitify-app/starred{/owner}{/repo}' as WebUrl,
        subscriptions_url:
          'https://api.github.com/users/gitify-app/subscriptions' as WebUrl,
        organizations_url:
          'https://api.github.com/users/gitify-app/orgs' as WebUrl,
        repos_url: 'https://api.github.com/users/gitify-app/repos' as WebUrl,
        events_url:
          'https://api.github.com/users/gitify-app/events{/privacy}' as WebUrl,
        received_events_url:
          'https://api.github.com/users/gitify-app/received_events' as WebUrl,
        type: 'User',
        site_admin: false,
      },
      private: true,
      html_url: 'https://github.com/gitify-app/notifications-test',
      description: null,
      fork: false,
      // Removed the rest of the properties
    } as unknown as Repository,
    url: 'https://api.github.com/notifications/threads/148827438' as WebUrl,
    subscription_url:
      'https://api.github.com/notifications/threads/148827438/subscription' as WebUrl,
  },
];

// 2 Notifications
// Hostname : 'github.gitify.io'
// Repository : 'myorg/notifications-test'
export const mockEnterpriseNotifications: Notification[] = [
  {
    account: mockGitHubEnterpriseServerAccount,
    id: '3',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T13:02:48Z',
    last_read_at: null,
    subject: {
      title: 'Release 0.0.1',
      url: 'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/3' as WebUrl,
      latest_comment_url:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/3' as WebUrl,
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
        avatar_url: 'https://github.gitify.io/avatars/u/4?' as WebUrl,
        gravatar_id: '',
        url: 'https://github.gitify.io/api/v3/users/myorg',
        html_url: 'https://github.gitify.io/myorg' as WebUrl,
        followers_url:
          'https://github.gitify.io/api/v3/users/myorg/followers' as WebUrl,
        following_url:
          'https://github.gitify.io/api/v3/users/myorg/following{/other_user}' as WebUrl,
        gists_url:
          'https://github.gitify.io/api/v3/users/myorg/gists{/gist_id}' as WebUrl,
        starred_url:
          'https://github.gitify.io/api/v3/users/myorg/starred{/owner}{/repo}' as WebUrl,
        subscriptions_url:
          'https://github.gitify.io/api/v3/users/myorg/subscriptions' as WebUrl,
        organizations_url:
          'https://github.gitify.io/api/v3/users/myorg/orgs' as WebUrl,
        repos_url:
          'https://github.gitify.io/api/v3/users/myorg/repos' as WebUrl,
        events_url:
          'https://github.gitify.io/api/v3/users/myorg/events{/privacy}' as WebUrl,
        received_events_url:
          'https://github.gitify.io/api/v3/users/myorg/received_events' as WebUrl,
        type: 'Organization',
        site_admin: false,
      },
      private: true,
      html_url: 'https://github.gitify.io/myorg/notifications-test' as WebUrl,
      description: null,
      fork: false,
      // Removed the rest of the properties
    } as unknown as Repository,
    url: 'https://github.gitify.io/api/v3/notifications/threads/4' as WebUrl,
    subscription_url:
      'https://github.gitify.io/api/v3/notifications/threads/4/subscription' as WebUrl,
  },
  {
    account: mockGitHubEnterpriseServerAccount,
    id: '4',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T15:52:20Z',
    last_read_at: '2017-05-20T14:20:55Z',
    subject: {
      title: 'Bump Version',
      url: 'https://github.gitify.io/api/v3/repos/myorg/notifications-test/pulls/4' as WebUrl,
      latest_comment_url:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/issues/comments/21' as WebUrl,
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
        avatar_url: 'https://github.gitify.io/avatars/u/4?' as WebUrl,
        gravatar_id: '',
        url: 'https://github.gitify.io/api/v3/users/myorg' as WebUrl,
        html_url: 'https://github.gitify.io/myorg' as WebUrl,
        followers_url:
          'https://github.gitify.io/api/v3/users/myorg/followers' as WebUrl,
        following_url:
          'https://github.gitify.io/api/v3/users/myorg/following{/other_user}' as WebUrl,
        gists_url:
          'https://github.gitify.io/api/v3/users/myorg/gists{/gist_id}' as WebUrl,
        starred_url:
          'https://github.gitify.io/api/v3/users/myorg/starred{/owner}{/repo}' as WebUrl,
        subscriptions_url:
          'https://github.gitify.io/api/v3/users/myorg/subscriptions' as WebUrl,
        organizations_url:
          'https://github.gitify.io/api/v3/users/myorg/orgs' as WebUrl,
        repos_url:
          'https://github.gitify.io/api/v3/users/myorg/repos' as WebUrl,
        events_url:
          'https://github.gitify.io/api/v3/users/myorg/events{/privacy}' as WebUrl,
        received_events_url:
          'https://github.gitify.io/api/v3/users/myorg/received_events' as WebUrl,
        type: 'Organization',
        site_admin: false,
      },
      private: true,
      html_url: 'https://github.gitify.io/myorg/notifications-test' as WebUrl,
      description: null,
      fork: false,
      // Removed the rest of the properties
    } as unknown as Repository,
    url: 'https://github.gitify.io/api/v3/notifications/threads/3' as WebUrl,
    subscription_url:
      'https://github.gitify.io/api/v3/notifications/threads/3/subscription' as WebUrl,
  },
];

const mockDiscussionAuthor: DiscussionAuthor = {
  login: 'comment-user',
  url: 'https://github.com/comment-user' as WebUrl,
  avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4' as WebUrl,
  type: 'User',
};

const mockDiscussionReplier: DiscussionAuthor = {
  login: 'reply-user',
  url: 'https://github.com/reply-user' as WebUrl,
  avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4' as WebUrl,
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

export const mockDiscussionLabels: DiscussionLabels = {
  nodes: [
    {
      name: 'enhancement',
    },
  ],
};

export const mockGraphQLResponse: GraphQLSearch<Discussion> = {
  data: {
    search: {
      nodes: [
        {
          title: '1.16.0',
          isAnswered: false,
          stateReason: 'OPEN',
          url: 'https://github.com/gitify-app/notifications-test/discussions/612' as WebUrl,
          author: {
            login: 'discussion-creator',
            url: 'https://github.com/discussion-creator' as WebUrl,
            avatar_url:
              'https://avatars.githubusercontent.com/u/123456789?v=4' as WebUrl,
            type: 'User',
          },
          comments: mockDiscussionComments,
          labels: mockDiscussionLabels,
        },
      ],
    },
  },
};

export const mockSingleNotification: Notification = mockGitHubNotifications[0];
