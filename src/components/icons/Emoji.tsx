import twemoji from '@twemoji/api';
import type { FC } from 'react';

export interface IEmoji {
  emoji: string;
}

export const Emoji: FC<IEmoji> = (props: IEmoji) => {
  // Generate the HTML for the emoji using twemoji
  const emojiHtml = twemoji.parse(props.emoji, {
    folder: 'svg',
    ext: '.svg',
  });

  // biome-ignore lint/security/noDangerouslySetInnerHtml: used for cross-platform emoji compatibility
  return <span dangerouslySetInnerHTML={{ __html: emojiHtml }} />;
};
