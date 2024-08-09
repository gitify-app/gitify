import path from 'node:path';
import twemoji from '@discordapp/twemoji';
import type { FC } from 'react';
import { getDirectoryPath } from '../../utils/helpers';

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
      const source = path.resolve(
        getDirectoryPath(),
        '../../node_modules/@discordapp/twemoji/dist',
      );

      return ''.concat(source, '/', options.size, '/', icon, options.ext);
    },
  });

  // biome-ignore lint/security/noDangerouslySetInnerHtml: used for cross-platform emoji compatibility
  return <span dangerouslySetInnerHTML={{ __html: emojiHtml }} />;
};
