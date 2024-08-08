import path from 'node:path';
import twemoji from '@twemoji/api';
import type { FC } from 'react';

export interface IEmoji {
  emoji: string;
}

type TwemojiOptions = {
  base: string;
  size: string;
  ext: string;
};

export const Emoji: FC<IEmoji> = (props: IEmoji) => {
  // Generate the HTML for the emoji using twemoji
  const emojiHtml = twemoji.parse(props.emoji, {
    folder: 'svg',
    ext: '.svg',
    callback: (icon: string, options: TwemojiOptions, _variant: string) => {
      // Offline
      let source: string;

      switch (icon) {
        // Offline Emojis sourced from ../assets/svg
        case '1f6dc': // 🛜 wifi/network
          source = path.resolve(`${__dirname}/../../assets`);
          break;
        default:
          source = options.base;
          break;
      }
      return ''.concat(source, '/', options.size, '/', icon, options.ext);
    },
  });

  // biome-ignore lint/security/noDangerouslySetInnerHtml: used for cross-platform emoji compatibility
  return <span dangerouslySetInnerHTML={{ __html: emojiHtml }} />;
};
