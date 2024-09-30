import type { ErrorType, GitifyError } from '../types';

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
