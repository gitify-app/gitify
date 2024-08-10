import { type FC, useMemo } from 'react';
import { Constants } from '../utils/constants';
import { EmojiText } from './EmojiText';

export const AllRead: FC = () => {
  const emoji = useMemo(
    () =>
      Constants.ALL_READ_EMOJIS[
        Math.floor(Math.random() * Constants.ALL_READ_EMOJIS.length)
      ],
    [],
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white p-4 text-black dark:bg-gray-dark dark:text-white">
      <div className="mt-2 mb-5 text-5xl">
        <EmojiText text={emoji} />
      </div>

      <div className="mb-2 text-xl font-semibold">No new notifications.</div>
    </div>
  );
};
