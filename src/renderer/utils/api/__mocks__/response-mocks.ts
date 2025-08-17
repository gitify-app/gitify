import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../../__mocks__/state-mocks';
import type { Link } from '../../../types';
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
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
  gravatar_url: '' as Link,
  url: 'https://api.github.com/users/octocat' as Link,
  html_url: 'https://github.com/octocat' as Link,
  followers_url: 'https://api.github.com/users/octocat/followers' as Link,
  following_url:
    'https://api.github.com/users/octocat/following{/other_user}' as Link,
  gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}' as Link,
  starred_url:
    'https://api.github.com/users/octocat/starred{/owner}{/repo}' as Link,
  subscriptions_url:
    'https://api.github.com/users/octocat/subscriptions' as Link,
  organizations_url: 'https://api.github.com/users/octocat/orgs' as Link,
  repos_url: 'https://api.github.com/users/octocat/repos' as Link,
  events_url: 'https://api.github.com/users/octocat/events{/privacy}' as Link,
  received_events_url:
    'https://api.github.com/users/octocat/received_events' as Link,
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
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
      latest_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
      type: 'Issue',
      state: 'open',
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
      node_id: 'MDEwOlJlcG9zaXRvcnkzNjAyOTcwNg==',
      name: 'notifications-test',
      full_name: 'gitify-app/notifications-test',
      url: 'https://api.github.com/gitify-app/notifications-test' as Link,
      owner: {
        login: 'gitify-app',
        id: 6333409,
        node_id: 'MDQ6VXNlcjYzMzM0MDk=',
        avatar_url:
          'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
        gravatar_id: '',
        url: 'https://api.github.com/users/gitify-app' as Link,
        html_url: 'https://github.com/gitify-app' as Link,
        followers_url:
          'https://api.github.com/users/gitify-app/followers' as Link,
        following_url:
          'https://api.github.com/users/gitify-app/following{/other_user}' as Link,
        gists_url:
          'https://api.github.com/users/gitify-app/gists{/gist_id}' as Link,
        starred_url:
          'https://api.github.com/users/gitify-app/starred{/owner}{/repo}' as Link,
        subscriptions_url:
          'https://api.github.com/users/gitify-app/subscriptions' as Link,
        organizations_url:
          'https://api.github.com/users/gitify-app/orgs' as Link,
        repos_url: 'https://api.github.com/users/gitify-app/repos' as Link,
        events_url:
          'https://api.github.com/users/gitify-app/events{/privacy}' as Link,
        received_events_url:
          'https://api.github.com/users/gitify-app/received_events' as Link,
        type: 'User',
        site_admin: false,
      },
      private: true,
      description: 'Test Repository',
      fork: false,
      archive_url:
        'https://api.github.com/repos/gitify-app/notifications-test/{archive_format}{/ref}' as Link,
      assignees_url:
        'https://api.github.com/repos/gitify-app/notifications-test/assignees{/user}' as Link,
      blobs_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/blobs{/sha}' as Link,
      branches_url:
        'https://api.github.com/repos/gitify-app/notifications-test/branches{/branch}' as Link,
      collaborators_url:
        'https://api.github.com/repos/gitify-app/notifications-test/collaborators{/collaborator}' as Link,
      comments_url:
        'https://api.github.com/repos/gitify-app/notifications-test/comments{/number}' as Link,
      commits_url:
        'https://api.github.com/repos/gitify-app/notifications-test/commits{/sha}' as Link,
      compare_url:
        'https://api.github.com/repos/gitify-app/notifications-test/compare/{base}...{head}' as Link,
      contents_url:
        'https://api.github.com/repos/gitify-app/notifications-test/contents/{+path}' as Link,
      contributors_url:
        'https://api.github.com/repos/gitify-app/notifications-test/contributors' as Link,
      deployments_url:
        'https://api.github.com/repos/gitify-app/notifications-test/deployments' as Link,
      downloads_url:
        'https://api.github.com/repos/gitify-app/notifications-test/downloads' as Link,
      events_url:
        'https://api.github.com/repos/gitify-app/notifications-test/events' as Link,
      forks_url:
        'https://api.github.com/repos/gitify-app/notifications-test/forks' as Link,
      git_commits_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/commits{/sha}' as Link,
      git_refs_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/refs{/sha}' as Link,
      git_tags_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/tags{/sha}' as Link,
      hooks_url:
        'https://api.github.com/repos/gitify-app/notifications-test/hooks' as Link,
      html_url: 'https://github.com/gitify-app/notifications-test' as Link,
      issue_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments{/number}' as Link,
      issue_events_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/events{/number}' as Link,
      issues_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues{/number}' as Link,
      keys_url:
        'https://api.github.com/repos/gitify-app/notifications-test/keys{/key_id}' as Link,
      labels_url:
        'https://api.github.com/repos/gitify-app/notifications-test/labels{/name}' as Link,
      languages_url:
        'https://api.github.com/repos/gitify-app/notifications-test/languages' as Link,
      merges_url:
        'https://api.github.com/repos/gitify-app/notifications-test/merges' as Link,
      milestones_url:
        'https://api.github.com/repos/gitify-app/notifications-test/milestones{/number}' as Link,
      notifications_url:
        'https://api.github.com/repos/gitify-app/notifications-test/notifications{?since,all,participating}' as Link,
      pulls_url:
        'https://api.github.com/repos/gitify-app/notifications-test/pulls{/number}' as Link,
      releases_url:
        'https://api.github.com/repos/gitify-app/notifications-test/releases{/id}' as Link,
      stargazers_url:
        'https://api.github.com/repos/gitify-app/notifications-test/stargazers' as Link,
      statuses_url:
        'https://api.github.com/repos/gitify-app/notifications-test/statuses/{sha}' as Link,
      subscribers_url:
        'https://api.github.com/repos/gitify-app/notifications-test/subscribers' as Link,
      subscription_url:
        'https://api.github.com/repos/gitify-app/notifications-test/subscription' as Link,
      tags_url:
        'https://api.github.com/repos/gitify-app/notifications-test/tags' as Link,
      teams_url:
        'https://api.github.com/repos/gitify-app/notifications-test/teams' as Link,
      trees_url:
        'https://api.github.com/repos/gitify-app/notifications-test/git/trees{/sha}' as Link,
    },
    url: 'https://api.github.com/notifications/threads/138661096' as Link,
    subscription_url:
      'https://api.github.com/notifications/threads/138661096/subscription' as Link,
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
      owner: {
        login: 'gitify-app',
        id: 6333409,
        avatar_url:
          'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
        gravatar_id: '',
        url: 'https://api.github.com/users/gitify-app' as Link,
        html_url: 'https://github.com/gitify-app' as Link,
        followers_url:
          'https://api.github.com/users/gitify-app/followers' as Link,
        following_url:
          'https://api.github.com/users/gitify-app/following{/other_user}' as Link,
        gists_url:
          'https://api.github.com/users/gitify-app/gists{/gist_id}' as Link,
        starred_url:
          'https://api.github.com/users/gitify-app/starred{/owner}{/repo}' as Link,
        subscriptions_url:
          'https://api.github.com/users/gitify-app/subscriptions' as Link,
        organizations_url:
          'https://api.github.com/users/gitify-app/orgs' as Link,
        repos_url: 'https://api.github.com/users/gitify-app/repos' as Link,
        events_url:
          'https://api.github.com/users/gitify-app/events{/privacy}' as Link,
        received_events_url:
          'https://api.github.com/users/gitify-app/received_events' as Link,
        type: 'User',
        site_admin: false,
      },
      private: true,
      html_url: 'https://github.com/gitify-app/notifications-test',
      description: null,
      fork: false,
      // Removed the rest of the properties
    } as unknown as Repository,
    url: 'https://api.github.com/notifications/threads/148827438' as Link,
    subscription_url:
      'https://api.github.com/notifications/threads/148827438/subscription' as Link,
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
      owner: {
        login: 'myorg',
        id: 4,
        avatar_url: 'https://github.gitify.io/avatars/u/4?' as Link,
        gravatar_id: '',
        url: 'https://github.gitify.io/api/v3/users/myorg',
        html_url: 'https://github.gitify.io/myorg' as Link,
        followers_url:
          'https://github.gitify.io/api/v3/users/myorg/followers' as Link,
        following_url:
          'https://github.gitify.io/api/v3/users/myorg/following{/other_user}' as Link,
        gists_url:
          'https://github.gitify.io/api/v3/users/myorg/gists{/gist_id}' as Link,
        starred_url:
          'https://github.gitify.io/api/v3/users/myorg/starred{/owner}{/repo}' as Link,
        subscriptions_url:
          'https://github.gitify.io/api/v3/users/myorg/subscriptions' as Link,
        organizations_url:
          'https://github.gitify.io/api/v3/users/myorg/orgs' as Link,
        repos_url: 'https://github.gitify.io/api/v3/users/myorg/repos' as Link,
        events_url:
          'https://github.gitify.io/api/v3/users/myorg/events{/privacy}' as Link,
        received_events_url:
          'https://github.gitify.io/api/v3/users/myorg/received_events' as Link,
        type: 'Organization',
        site_admin: false,
      },
      private: true,
      html_url: 'https://github.gitify.io/myorg/notifications-test' as Link,
      description: null,
      fork: false,
      // Removed the rest of the properties
    } as unknown as Repository,
    url: 'https://github.gitify.io/api/v3/notifications/threads/4' as Link,
    subscription_url:
      'https://github.gitify.io/api/v3/notifications/threads/4/subscription' as Link,
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
      owner: {
        login: 'myorg',
        id: 4,
        avatar_url: 'https://github.gitify.io/avatars/u/4?' as Link,
        gravatar_id: '',
        url: 'https://github.gitify.io/api/v3/users/myorg' as Link,
        html_url: 'https://github.gitify.io/myorg' as Link,
        followers_url:
          'https://github.gitify.io/api/v3/users/myorg/followers' as Link,
        following_url:
          'https://github.gitify.io/api/v3/users/myorg/following{/other_user}' as Link,
        gists_url:
          'https://github.gitify.io/api/v3/users/myorg/gists{/gist_id}' as Link,
        starred_url:
          'https://github.gitify.io/api/v3/users/myorg/starred{/owner}{/repo}' as Link,
        subscriptions_url:
          'https://github.gitify.io/api/v3/users/myorg/subscriptions' as Link,
        organizations_url:
          'https://github.gitify.io/api/v3/users/myorg/orgs' as Link,
        repos_url: 'https://github.gitify.io/api/v3/users/myorg/repos' as Link,
        events_url:
          'https://github.gitify.io/api/v3/users/myorg/events{/privacy}' as Link,
        received_events_url:
          'https://github.gitify.io/api/v3/users/myorg/received_events' as Link,
        type: 'Organization',
        site_admin: false,
      },
      private: true,
      html_url: 'https://github.gitify.io/myorg/notifications-test' as Link,
      description: null,
      fork: false,
      // Removed the rest of the properties
    } as unknown as Repository,
    url: 'https://github.gitify.io/api/v3/notifications/threads/3' as Link,
    subscription_url:
      'https://github.gitify.io/api/v3/notifications/threads/3/subscription' as Link,
  },
];

const mockDiscussionAuthor: DiscussionAuthor = {
  login: 'comment-user',
  url: 'https://github.com/comment-user' as Link,
  avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4' as Link,
  type: 'User',
};

const mockDiscussionReplier: DiscussionAuthor = {
  login: 'reply-user',
  url: 'https://github.com/reply-user' as Link,
  avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4' as Link,
  type: 'User',
};

export const mockDiscussionComments: DiscussionComments = {
  nodes: [
    {
      databaseId: 2258799,
      createdAt: '2017-02-20T17:51:57Z',
      author: mockDiscussionAuthor,
      replies: {
        nodes: [
          {
            databaseId: 2300902,
            createdAt: '2017-05-20T17:51:57Z',
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
          number: 123,
          title: '1.16.0',
          isAnswered: false,
          stateReason: 'OPEN',
          url: 'https://github.com/gitify-app/notifications-test/discussions/612' as Link,
          author: {
            login: 'discussion-creator',
            url: 'https://github.com/discussion-creator' as Link,
            avatar_url:
              'https://avatars.githubusercontent.com/u/123456789?v=4' as Link,
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
