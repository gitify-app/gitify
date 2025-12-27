import twemoji, { type TwemojiOptions } from '@discordapp/twemoji';

import { isTauriEnvironment } from './environment';

const EMOJI_FORMAT = 'svg';
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/';

export async function convertTextToEmojiImgHtml(text: string): Promise<string> {
  if (!isTauriEnvironment()) {
    // Browser fallback - use CDN
    return twemoji.parse(text, {
      folder: EMOJI_FORMAT,
      base: CDN_BASE,
    });
  }

  // In Tauri mode, convert local file paths to asset:// URLs
  const { convertFileSrc } = await import('@tauri-apps/api/core');
  const directory = await window.gitify.twemojiDirectory();

  return twemoji.parse(text, {
    callback: (icon: string, _options: TwemojiOptions) => {
      const filePath = `${directory}/${icon}.${EMOJI_FORMAT}`;
      return convertFileSrc(filePath);
    },
  });
}
