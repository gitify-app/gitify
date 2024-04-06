export const Constants = {
  // GitHub OAuth
  AUTH_SCOPE: ['read:user', 'notifications', 'repo'],

  DEFAULT_AUTH_OPTIONS: {
    hostname: 'github.com',
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
  },

  REPO_SLUG: 'gitify-app/gitify',

  // Storage
  STORAGE_KEY: 'gitify-storage',

  ALLREAD_EMOJIS: ['😉', '🎉', '🐯', '🙈', '🎈', '🎊', '👏', '🎪', '🍝'],

  ERROR_EMOJIS: ['🤔', '😞', '😤', '😱', '😭'],

  ERROR_MESSAGES: {
    BAD_CREDENTIALS: 'Bad credentials',
    MISSING_SCOPES: "Missing the 'notifications' scope",
    RATE_LIMITED_PRIMARY: 'API rate limit exceeded',
    RATE_LIMITED_SECONDARY: 'You have exceeded a secondary rate limit',
  },
};

export default Constants;
