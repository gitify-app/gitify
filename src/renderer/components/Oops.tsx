import { type FC, useMemo } from 'react';

import type { GitifyError } from '../types';
import { Errors } from '../utils/errors';
import { EmojiSplash } from './layout/EmojiSplash';

interface IOops {
  error: GitifyError;
  fullHeight?: boolean;
}

export const Oops: FC<IOops> = ({ error, fullHeight = true }: IOops) => {
  const err = error ?? Errors.UNKNOWN;

  const emoji = useMemo(
    // NOSONAR: Non-secure PRNG is acceptable here
    () => err.emojis[Math.floor(Math.random() * err.emojis.length)],
    [err],
  );

  return (
    <EmojiSplash
      emoji={emoji}
      heading={err.title}
      subHeadings={err.descriptions}
      fullHeight={fullHeight}
    />
  );
};
