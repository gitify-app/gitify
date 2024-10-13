import { type FC, useMemo } from 'react';

import { Stack } from '@primer/react';

import { Constants } from '../utils/constants';
import { EmojiText } from './EmojiText';
import { Centered } from './primitives/Centered';

export const AllRead: FC = () => {
  const emoji = useMemo(
    () =>
      Constants.ALL_READ_EMOJIS[
        Math.floor(Math.random() * Constants.ALL_READ_EMOJIS.length)
      ],
    [],
  );

  return (
    <Centered>
      <Stack direction="vertical" align="center">
        <div className="mt-2 mb-5 text-5xl">
          <EmojiText text={emoji} />
        </div>

        <div className="mb-2 text-xl font-semibold">No new notifications</div>
      </Stack>
    </Centered>
  );
};
