import { type FC, useEffect, useRef } from 'react';

import { convertTextToEmojiImgHtml } from '../../utils/emojis';
export interface IEmojiText {
  text: string;
}
export const EmojiText: FC<IEmojiText> = ({ text }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const updateEmojiText = async () => {
      const emojiHtml = await convertTextToEmojiImgHtml(text);

      if (!mountedRef.current) {
        return;
      }

      if (ref.current) {
        ref.current.innerHTML = emojiHtml;
      }
    };

    updateEmojiText();

    return () => {
      mountedRef.current = false;
    };
  }, [text]);

  return <div className="text-7xl" ref={ref} />;
};
