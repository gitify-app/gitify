import { type FC, useMemo } from 'react';

import { Constants } from '../constants';

import { EmojiSplash } from './layout/EmojiSplash';

import { useFiltersStore } from '../stores';

interface AllReadProps {
  fullHeight?: boolean;
}

export const AllRead: FC<AllReadProps> = ({
  fullHeight = true,
}: AllReadProps) => {
  const hasFilters = useFiltersStore((s) => s.hasActiveFilters());

  const emoji = useMemo(
    () =>
      Constants.EMOJIS.ALL_READ[
        Math.floor(Math.random() * Constants.EMOJIS.ALL_READ.length)
      ],
    [],
  );

  const heading = `No new ${hasFilters ? 'filtered ' : ''} notifications`;

  return (
    <EmojiSplash emoji={emoji} fullHeight={fullHeight} heading={heading} />
  );
};
