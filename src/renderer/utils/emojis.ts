// import path from "node:path";
// import twemoji, { type TwemojiOptions } from '@discordapp/twemoji';
import { Constants } from './constants';
import { Errors } from './errors';

// const EMOJI_FORMAT = 'svg';

const ALL_EMOJIS = [
  ...Constants.ALL_READ_EMOJIS,
  ...Errors.BAD_CREDENTIALS.emojis,
  ...Errors.MISSING_SCOPES.emojis,
  ...Errors.NETWORK.emojis,
  ...Errors.RATE_LIMITED.emojis,
  ...Errors.UNKNOWN.emojis,
];

export const ALL_EMOJI_SVG_FILENAMES = ALL_EMOJIS.map((emoji) => {
  const imgHtml = convertTextToEmojiImgHtml(emoji);
  return extractSvgFilename(imgHtml);
});

export function convertTextToEmojiImgHtml(text: string): string {
  return text;
  // return twemoji.parse(text, {
  //   folder: EMOJI_FORMAT,
  //   callback: (icon: string, _options: TwemojiOptions) => {
  //     return path.join('images', 'twemoji', `${icon}.${EMOJI_FORMAT}`);
  //   },
  // });
}

function extractSvgFilename(imgHtml: string): string {
  return imgHtml;
  // const srcMatch = /src="(.*)"/.exec(imgHtml);
  // return path.basename(srcMatch[1]);
}
