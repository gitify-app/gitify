import { type FC, useContext, useMemo } from 'react';

import { Stack } from '@primer/react';

import { AppContext } from '../context/App';
import { Constants } from '../utils/constants';
import { hasFiltersSet } from '../utils/filters';
import { Centered } from './primitives/Centered';
import { EmojiText } from './primitives/EmojiText';

export const AllRead: FC = () => {
  const { settings } = useContext(AppContext);

  const hasFilters = hasFiltersSet(settings);

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

        {hasFilters ? (
          <div className="mb-2 text-xl font-semibold">
            No new filtered notifications
          </div>
        ) : (
          <div className="mb-2 text-xl font-semibold">No new notifications</div>
        )}
      </Stack>
    </Centered>
  );
};
