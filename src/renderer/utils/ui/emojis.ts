import twemoji, { type TwemojiOptions } from '@discordapp/twemoji';

const EMOJI_FORMAT = 'svg';

/**
 * Parses a text string and replaces Unicode emoji characters with local SVG `<img>` tags.
 * The SVG file paths are resolved from the Electron main process.
 *
 * @param text - The text string potentially containing emoji characters.
 * @returns Promise resolving to an HTML string with emojis replaced by `<img>` elements.
 */
export async function convertTextToEmojiImgHtml(text: string): Promise<string> {
  const directory = await window.gitify.twemojiDirectory();

  return twemoji.parse(text, {
    folder: EMOJI_FORMAT,
    callback: (icon: string, _options: TwemojiOptions) => {
      return `${directory}/${icon}.${EMOJI_FORMAT}`;
    },
  });
}
