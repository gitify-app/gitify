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
        callback: (icon: string, options: TwemojiOptions, _variant: string) => {
          const source = path.resolve(
            getDirectoryPath(),
            '../../node_modules/@discordapp/twemoji/dist',
          );

          return ''.concat(source, '/', options.size, '/', icon, options.ext);
        },
      });
    }
  }, [text]);

  return <span ref={ref} />;
};
