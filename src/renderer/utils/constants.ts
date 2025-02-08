import type { ClientID, ClientSecret, Hostname, Link } from '../types';

export const Constants = {
  REPO_SLUG: 'gitify-app/gitify',

  // Storage
  STORAGE_KEY: 'gitify-storage',

  NOTIFICATION_SOUND: 'clearly.mp3',

  // GitHub OAuth
  AUTH_SCOPE: ['read:user', 'notifications', 'repo'],

  DEFAULT_AUTH_OPTIONS: {
    hostname: 'github.com' as Hostname,
    clientId: process.env.OAUTH_CLIENT_ID as ClientID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET as ClientSecret,
  },

  GITHUB_API_BASE_URL: 'https://api.github.com',
  GITHUB_API_GRAPHQL_URL: 'https://api.github.com/graphql',

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
