import { type FC, useMemo } from 'react';

import { Stack } from '@primer/react';
import type { GitifyError } from '../types';
import { Centered } from './primitives/Centered';
import { EmojiText } from './primitives/EmojiText';

interface IOops {
  error: GitifyError;
}

export const Oops: FC<IOops> = ({ error }: IOops) => {
  const emoji = useMemo(
    () => error.emojis[Math.floor(Math.random() * error.emojis.length)],
    [error],
  );

  return (
    <Centered>
      <Stack direction="vertical" align="center">
        <div className="mt-2 text-5xl">
          <EmojiText text={emoji} />
        </div>

        <div className="mb-2 text-xl font-semibold">{error.title}</div>
        {error.descriptions.map((description, i) => {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: using index for key to keep the error constants clean
            <div className="mb-2 text-center" key={`error_description_${i}`}>
              {description}
            </div>
          );
        })}
      </Stack>
    </Centered>
  );
};
