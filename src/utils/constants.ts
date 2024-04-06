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

  ERRORS: {
    BAD_CREDENTIALS: {
      title: 'Bad Credentials',
      description: 'Your credentials are either invalid or expired.',
      emojis: ['🔓'],
    },
    MISSING_SCOPES: {
      title: 'Missing Scopes',
      description: 'Your credentials are missing a required API scope.',
      emojis: ['🙃'],
    },
    RATE_LIMITED: {
      title: 'Rate Limited',
      description:
        'You have made too many requests. Please wait a while before trying again.',
      emojis: ['😮‍💨'],
    },
    DEFAULT_ERROR: {
      title: 'Oops! Something went wrong',
      description: 'Please try again later.',
      emojis: ['🤔', '😞', '😤', '😱', '😭'],
    },
  },
};

export default Constants;
