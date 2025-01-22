import { type FC, useEffect, useRef } from 'react';

import { Box } from '@primer/react';
import { convertTextToEmojiImgHtml } from '../../utils/emojis';

export interface IEmojiText {
  text: string;
}

export const EmojiText: FC<IEmojiText> = ({ text }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = convertTextToEmojiImgHtml(text);
    }
  }, [text]);

  return <Box ref={ref} className="text-5xl" />;
};
