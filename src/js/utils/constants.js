export default {
  // GitHub OAuth
  AUTH_SCOPE: ['user:email', 'notifications'],

  DEFAULT_AUTH_OPTIONS: {
    hostname: 'github.com',
    clientId: '3fef4433a29c6ad8f22c',
    clientSecret: '9670de733096c15322183ff17ed0fc8704050379',
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
    ':ok_hand:',
  ],

  ERROR_EMOJIS: [
    ':pensive:',
    ':disappointed:',
    ':triumph:',
    ':scream:',
    ':cry:',
  ],
};
