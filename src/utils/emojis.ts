import twemoji, { type TwemojiOptions } from '@discordapp/twemoji';
import { convertFileSrc } from '@tauri-apps/api/core';

const EMOJI_FORMAT = 'svg';

export async function convertTextToEmojiImgHtml(text: string): Promise<string> {
  const directory = await window.gitify.twemojiDirectory();

  return twemoji.parse(text, {
    callback: (icon: string, _options: TwemojiOptions) => {
      const filePath = `${directory}/${icon}.${EMOJI_FORMAT}`;
      return convertFileSrc(filePath);
    },
  });
}
