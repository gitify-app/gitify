import type { ErrorType, GitifyError, Link } from '../types';
import type { ClientID, ClientSecret, Hostname } from '../types';

export const Constants = {
  // GitHub OAuth
  AUTH_SCOPE: ['read:user', 'notifications', 'repo'],

  DEFAULT_AUTH_OPTIONS: {
    hostname: 'github.com' as Hostname,
    clientId: process.env.OAUTH_CLIENT_ID as ClientID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET as ClientSecret,
  },

  GITHUB_API_BASE_URL: 'https://api.github.com',
  GITHUB_API_GRAPHQL_URL: 'https://api.github.com/graphql',

  REPO_SLUG: 'gitify-app/gitify',

  // Storage
  STORAGE_KEY: 'gitify-storage',

  ALL_READ_EMOJIS: ['🎉', '🎊', '🥳', '👏', '🙌', '😎', '🏖️', '🚀', '✨', '🏆'],

  FETCH_NOTIFICATIONS_INTERVAL: 60000,
  REFRESH_ACCOUNTS_INTERVAL: 3600000,

  DEFAULT_KEYBOARD_SHORTCUT: 'CommandOrControl+Shift+G',

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

export const Errors: Record<ErrorType, GitifyError> = {
  BAD_CREDENTIALS: {
    title: 'Bad Credentials',
    descriptions: ['Your credentials are either invalid or expired.'],
    emojis: ['🔓'],
  },
  MISSING_SCOPES: {
    title: 'Missing Scopes',
    descriptions: ['Your credentials are missing a required API scope.'],
    emojis: ['🔭'],
  },
  NETWORK: {
    title: 'Network Error',
    descriptions: [
      'Unable to connect to one or more of your GitHub environments.',
      'Please check your network connection, including whether you require a VPN, and try again.',
    ],
    emojis: ['🛜'],
  },
  RATE_LIMITED: {
    title: 'Rate Limited',
    descriptions: ['Please wait a while before trying again.'],
    emojis: ['😮‍💨'],
  },
  UNKNOWN: {
    title: 'Oops! Something went wrong',
    descriptions: ['Please try again later.'],
    emojis: ['🤔', '🥲', '😳', '🫠', '🙃', '🙈'],
  },
};

export default Constants;
