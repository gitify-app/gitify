import twemoji from '@discordapp/twemoji';
import { Constants } from './constants';
import { Errors } from './errors';

const ALL_EMOJIS = [
  ...Constants.ALL_READ_EMOJIS,
  ...Errors.BAD_CREDENTIALS.emojis,
  ...Errors.MISSING_SCOPES.emojis,
  ...Errors.NETWORK.emojis,
  ...Errors.RATE_LIMITED.emojis,
  ...Errors.UNKNOWN.emojis,
];

export const EMOJI_CODE_POINTS = ALL_EMOJIS.map((emoji) =>
  twemoji.convert.toCodePoint(emoji),
);
