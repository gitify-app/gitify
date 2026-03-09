import twemoji, { type TwemojiOptions } from '@discordapp/twemoji';

const EMOJI_FORMAT = 'svg';

export async function convertTextToEmojiImgHtml(text: string): Promise<string> {
  const directory = await window.gitify.twemojiDirectory();

  return twemoji.parse(text, {
    folder: EMOJI_FORMAT,
    callback: (icon: string, _options: TwemojiOptions) => {
      return `${directory}/${icon}.${EMOJI_FORMAT}`;
    },
  });
}
