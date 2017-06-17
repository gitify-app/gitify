import { fromJS } from 'immutable';

export const mockedEnterpriseAccounts = fromJS([
  {
    hostname: 'github.gitify.io',
    token: '1234568790',
  },
]);

// 2 Notifications
// Repository : 'manosim/notifications-tests'
export const mockedGithubNotifications = fromJS([
  {
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
    },
    url: 'https://api.github.com/notifications/threads/138661096',
    subscription_url:
      'https://api.github.com/notifications/threads/138661096/subscription',
  },
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
    },
    url: 'https://api.github.com/notifications/threads/148827438',
    subscription_url:
      'https://api.github.com/notifications/threads/148827438/subscription',
  },
]);

// 2 Notifications
// Repository : 'myorg/notifications-test'
export const mockedEnterpriseNotifications = fromJS([
  {
    id: '4',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T13:02:48Z',
    last_read_at: null,
    subject: {
      title: 'Release 0.0.1',
      url:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/1',
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
    },
    url: 'https://github.gitify.io/api/v3/notifications/threads/4',
    subscription_url:
      'https://github.gitify.io/api/v3/notifications/threads/4/subscription',
  },
  {
    id: '3',
    unread: true,
    reason: 'subscribed',
    updated_at: '2017-05-20T15:52:20Z',
    last_read_at: '2017-05-20T14:20:55Z',
    subject: {
      title: 'Bump Version',
      url:
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/pulls/3',
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
    },
    url: 'https://github.gitify.io/api/v3/notifications/threads/3',
    subscription_url:
      'https://github.gitify.io/api/v3/notifications/threads/3/subscription',
  },
]);

export const mockedNotificationsRecuderData = fromJS([
  {
    hostname: 'github.com',
    notifications: mockedGithubNotifications,
  },
  {
    hostname: 'github.gitify.io',
    notifications: mockedEnterpriseNotifications,
  },
]);
