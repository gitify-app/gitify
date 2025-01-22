import { type FC, useMemo } from 'react';

import type { GitifyError } from '../types';
import { EmojiSplash } from './layout/EmojiSplash';

interface IOops {
  error: GitifyError;
  fullHeight?: boolean;
}

export const Oops: FC<IOops> = ({ error, fullHeight = true }: IOops) => {
  const emoji = useMemo(
    () => error.emojis[Math.floor(Math.random() * error.emojis.length)],
    [error],
  );

  return (
    <EmojiSplash
      emoji={emoji}
      heading={error.title}
      subHeadings={error.descriptions}
      fullHeight={fullHeight}
    />
  );
};
