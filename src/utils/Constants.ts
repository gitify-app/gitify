export const Constants = {
  // GitHub OAuth
  AUTH_SCOPE: ['user:email', 'notifications'],

  DEFAULT_AUTH_OPTIONS: {
    hostname: 'github.com',
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
  },

  REPO_SLUG: 'manosim/gitify',

  // Storage
  STORAGE_KEY: 'gitify-storage',

  // Awesome all read messages
  ALLREAD_MESSAGES: [
    'Wow! You did it.',
    "That's amazing!",
    'Yes! All read.',
    'All gone! Nice work!',
    'Yay! Good news.',
  ],

  ALLREAD_EMOJIS: [
    ':wink:',
    ':tada:',
    ':tiger:',
    ':see_no_evil:',
    ':balloon:',
    ':confetti_ball:',
    ':clap:',
    ':circus_tent:',
    ':spaghetti:',
  ],

  ERROR_EMOJIS: [
    ':pensive:',
    ':disappointed:',
    ':triumph:',
    ':scream:',
    ':cry:',
  ],
};

export default Constants;
