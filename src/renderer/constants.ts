import type { ClientID, Hostname, Link } from './types';

type OAuthScope = 'NOTIFICATIONS' | 'READ_USER' | 'REPO' | 'PUBLIC_REPO';

type OAuthScopeDetails = {
  readonly name: string;
  readonly description: string;
};

/**
 * Structured OAuth scope definitions. Co-locate name + description so they
 * can never drift apart. Import OAUTH_SCOPE directly when you need to reference
 * a specific scope object (e.g. to access its description in the UI).
 */
export const OAUTH_SCOPE: Record<OAuthScope, OAuthScopeDetails> = {
  NOTIFICATIONS: {
    name: 'notifications',
    description: 'Access GitHub notification inbox',
  },
  READ_USER: {
    name: 'read:user',
    description: 'Account details (name, avatar, profile)',
  },
  REPO: {
    name: 'repo',
    description: 'Enriched notifications for private and public repositories',
  },
  PUBLIC_REPO: {
    name: 'public_repo',
    description: 'Enriched notifications for public repositories only',
  },
};

export const Constants = {
  STORAGE_KEY: 'gitify-storage',

  // Zustand persist store keys
  ACCOUNTS_STORE_KEY: 'gitify-accounts',
  SETTINGS_STORE_KEY: 'gitify-settings',
  FILTERS_STORE_KEY: 'atlassify-filters',

  // GitHub OAuth Scopes — each tier is an ordered array of OAUTH_SCOPE objects.
  // REQUIRED: minimum scopes Gitify needs to function.
  // RECOMMENDED: recommended enrichment (private + public repos).
  // ALTERNATE: lighter path — public repos only.
  OAUTH_SCOPES: {
    REQUIRED: [OAUTH_SCOPE.NOTIFICATIONS, OAUTH_SCOPE.READ_USER],
    RECOMMENDED: [
      OAUTH_SCOPE.NOTIFICATIONS,
      OAUTH_SCOPE.READ_USER,
      OAUTH_SCOPE.REPO,
    ],
    ALTERNATE: [
      OAUTH_SCOPE.NOTIFICATIONS,
      OAUTH_SCOPE.READ_USER,
      OAUTH_SCOPE.PUBLIC_REPO,
    ],
  },

  GITHUB_HOSTNAME: 'github.com' as Hostname,

  OAUTH_DEVICE_FLOW_CLIENT_ID: process.env.OAUTH_CLIENT_ID as ClientID,

  // GitHub Enterprise Cloud with Data Residency uses *.ghe.com domains
  GITHUB_ENTERPRISE_CLOUD_DATA_RESIDENCY_HOSTNAME: 'ghe.com',

  GITHUB_API_BASE_URL: 'https://api.github.com',
  GITHUB_API_GRAPHQL_URL: 'https://api.github.com/graphql',
  GITHUB_API_MERGE_BATCH_SIZE: 100,

  // Emojis for different states and events
  EMOJIS: {
    ALL_READ: ['🎉', '🎊', '🥳', '👏', '🙌', '😎', '🏖️', '🚀', '✨', '🏆'],
    ERRORS: {
      BAD_CREDENTIALS: ['🔓'],
      MISSING_SCOPES: ['🔭'],
      NETWORK: ['🛜'],
      RATE_LIMITED: ['😮‍💨'],
      UNKNOWN: ['🤔', '🥲', '😳', '🫠', '🙃', '🙈'],
    },
  },

  DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS: 60 * 1000, // 1 minute
  MIN_FETCH_NOTIFICATIONS_INTERVAL_MS: 60 * 1000, // 1 minute
  MAX_FETCH_NOTIFICATIONS_INTERVAL_MS: 60 * 60 * 1000, // 1 hour
  FETCH_NOTIFICATIONS_INTERVAL_STEP_MS: 60 * 1000, // 1 minute

  REFRESH_ACCOUNTS_INTERVAL_MS: 60 * 60 * 1000, // 1 hour

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
