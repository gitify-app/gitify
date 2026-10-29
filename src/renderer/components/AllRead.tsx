import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Constants } from '../constants';

import { useFiltersStore } from '../stores';

import { EmojiSplash } from './layout/EmojiSplash';

import { randomElement } from '../utils/core/random';

interface AllReadProps {
  fullHeight?: boolean;
}

export function AllRead({ fullHeight = true }: Readonly<AllReadProps>) {
  const { t } = useTranslation();
  const hasFilters = useFiltersStore((s) => s.hasActiveFilters());

  const emoji = useMemo(() => randomElement(Constants.EMOJIS.ALL_READ), []);

  const heading = hasFilters
    ? t('allRead.heading_filtered', 'No new filtered notifications')
    : t('allRead.heading', 'No new notifications');

  return <EmojiSplash emoji={emoji} fullHeight={fullHeight} heading={heading} />;
}
