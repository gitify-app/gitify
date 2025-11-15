import { type FC, useMemo } from 'react';

import type { GitifyError } from '../types';
import { Errors } from '../utils/errors';
import { EmojiSplash } from './layout/EmojiSplash';

interface OopsProps {
  error: GitifyError;
  fullHeight?: boolean;
}

export const Oops: FC<OopsProps> = ({
  error,
  fullHeight = true,
}: OopsProps) => {
  const err = error ?? Errors.UNKNOWN;

  const emoji = useMemo(
    () => err.emojis[Math.floor(Math.random() * err.emojis.length)],
    [err],
  );

  return (
    <EmojiSplash
      emoji={emoji}
      fullHeight={fullHeight}
      heading={err.title}
      subHeadings={err.descriptions}
    />
  );
};
