import { type FC, useContext, useMemo } from 'react';

import { AppContext } from '../context/App';
import { Constants } from '../utils/constants';
import { hasAnyFiltersSet } from '../utils/filters';
import { EmojiSplash } from './layout/EmojiSplash';

interface IAllRead {
  fullHeight?: boolean;
}

export const AllRead: FC<IAllRead> = ({ fullHeight = true }: IAllRead) => {
  const { settings } = useContext(AppContext);

  const hasFilters = hasAnyFiltersSet(settings);

  const emoji = useMemo(
    () =>
      Constants.ALL_READ_EMOJIS[
        Math.floor(Math.random() * Constants.ALL_READ_EMOJIS.length)
      ],
    [],
  );

  const heading = `No new ${hasFilters ? 'filtered ' : ''} notifications`;

  return (
    <EmojiSplash emoji={emoji} heading={heading} fullHeight={fullHeight} />
  );
};
