import { type FC, useMemo } from 'react';

import { Constants } from '../constants';

import { EmojiSplash } from './layout/EmojiSplash';

import { useFiltersStore } from '../stores';
import { randomElement } from '../utils/core/random';

interface AllReadProps {
  fullHeight?: boolean;
}

export const AllRead: FC<AllReadProps> = ({
  fullHeight = true,
}: AllReadProps) => {
  const hasFilters = useFiltersStore((s) => s.hasActiveFilters());

  const emoji = useMemo(() => randomElement(Constants.EMOJIS.ALL_READ), []);

  const heading = `No new ${hasFilters ? 'filtered ' : ''} notifications`;

  return (
    <EmojiSplash emoji={emoji} fullHeight={fullHeight} heading={heading} />
  );
};
