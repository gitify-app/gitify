import type { ErrorType, GitifyError } from '../types';

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

  FETCH_INTERVAL: 60000,
};

export const Errors: Record<ErrorType, GitifyError> = {
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
    description: 'Please wait a while before trying again.',
    emojis: ['😮‍💨'],
  },
  UNKNOWN: {
    title: 'Oops! Something went wrong',
    description: 'Please try again later.',
    emojis: ['🤔', '😞', '😤', '😱', '😭'],
  },
};

export default Constants;
