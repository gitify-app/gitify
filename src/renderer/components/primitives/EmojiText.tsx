import { type FC, useEffect, useRef } from 'react';

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

  return <span ref={ref} />;
};
