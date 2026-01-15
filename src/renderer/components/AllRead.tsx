import { type FC, useMemo } from 'react';

import { Constants } from '../constants';
import { useAppContext } from '../hooks/useAppContext';
import { hasActiveFilters } from '../utils/notifications/filters/filter';
import { EmojiSplash } from './layout/EmojiSplash';

interface AllReadProps {
  fullHeight?: boolean;
}

export const AllRead: FC<AllReadProps> = ({
  fullHeight = true,
}: AllReadProps) => {
  const { settings } = useAppContext();

  const hasFilters = hasActiveFilters(settings);

  const emoji = useMemo(
    () =>
      Constants.ALL_READ_EMOJIS[
        Math.floor(Math.random() * Constants.ALL_READ_EMOJIS.length)
      ],
    [],
  );

  const heading = `No new ${hasFilters ? 'filtered ' : ''} notifications`;

  return (
    <EmojiSplash emoji={emoji} fullHeight={fullHeight} heading={heading} />
  );
};
