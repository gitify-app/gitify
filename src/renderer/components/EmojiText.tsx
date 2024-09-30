import path from 'node:path';
import twemoji from '@discordapp/twemoji';
import { type FC, useEffect, useRef } from 'react';
import { getDirectoryPath } from '../utils/helpers';

export interface IEmojiText {
  text: string;
}

type TwemojiOptions = {
  base: string;
  size: string;
  ext: string;
};

export const EmojiText: FC<IEmojiText> = ({ text }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = twemoji.parse(text, {
        folder: 'svg',
        ext: '.svg',
        callback: (
          icon: string,
          _options: TwemojiOptions,
          _variant: string,
        ) => {
          return path.join(
            getDirectoryPath(),
            'assets',
            'twemoji',
            `${icon}.svg`,
          );
        },
      });
    }
  }, [text]);

  return <span ref={ref} />;
};
