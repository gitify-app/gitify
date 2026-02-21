import type { ClientID, Hostname, Link } from './types';

export const Constants = {
  // TODO - remove after a few versions
  STORAGE_KEY: 'gitify-storage',

  // Accounts store key
  ACCOUNTS_STORE_KEY: 'gitify-accounts',

  // Filters store key
  FILTERS_STORE_KEY: 'gitify-filters',

  // Settings store key
  SETTINGS_STORE_KEY: 'gitify-settings',

  // GitHub OAuth Scopes
  OAUTH_SCOPES: {
    RECOMMENDED: ['read:user', 'notifications', 'repo'],
    ALTERNATE: ['read:user', 'notifications', 'public_repo'],
  },

  GITHUB_HOSTNAME: 'github.com' as Hostname,

  OAUTH_DEVICE_FLOW_CLIENT_ID: process.env.OAUTH_CLIENT_ID as ClientID,

  // GitHub Enterprise Cloud with Data Residency uses *.ghe.com domains
  GITHUB_ENTERPRISE_CLOUD_DATA_RESIDENCY_HOSTNAME: 'ghe.com',

  GITHUB_API_BASE_URL: 'https://api.github.com',
  GITHUB_API_GRAPHQL_URL: 'https://api.github.com/graphql',
  GITHUB_API_MERGE_BATCH_SIZE: 100,

  ALL_READ_EMOJIS: ['🎉', '🎊', '🥳', '👏', '🙌', '😎', '🏖️', '🚀', '✨', '🏆'],

  // Fetch notifications interval in milliseconds, used by useNotifications hook
  DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS: 60 * 1000, // 1 minute
  MIN_FETCH_NOTIFICATIONS_INTERVAL_MS: 60 * 1000, // 1 minute
  MAX_FETCH_NOTIFICATIONS_INTERVAL_MS: 60 * 60 * 1000, // 1 hour

  // Fetch notifications interval in milliseconds, used by useNotifications hook
  FETCH_NOTIFICATIONS_INTERVAL_STEP_MS: 60 * 1000, // 1 minute

  // Fetch accounts interval in milliseconds, used by useAccounts hook
  REFRESH_ACCOUNTS_INTERVAL_MS: 60 * 60 * 1000, // 1 hour

  // Query stale time in milliseconds, used by TanStack Query client
  QUERY_STALE_TIME_MS: 30 * 1000, // 30 seconds

  // GraphQL Argument Defaults
  GRAPHQL_ARGS: {
    FIRST_LABELS: 100,
    FIRST_CLOSING_ISSUES: 100,
    LAST_COMMENTS: 1,
    LAST_THREADED_COMMENTS: 10,
    LAST_REPLIES: 10,
    LAST_REVIEWS: 100,
  },

  // GitHub Docs
  GITHUB_DOCS: {
    OAUTH_URL:
      'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authenticating-to-the-rest-api-with-an-oauth-app' as Link,
    PAT_URL:
      'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens' as Link,
    PARTICIPATING_URL:
      'https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications#about-participating-and-watching-notifications' as Link,
  },
};
