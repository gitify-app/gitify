import { useMemo } from 'react';

import { Constants } from '../constants';

import { useFiltersStore } from '../stores';

import { EmojiSplash } from './layout/EmojiSplash';

import { randomElement } from '../utils/core/random';

interface AllReadProps {
  fullHeight?: boolean;
  /**
   * Set when Gitify knows organizations are withholding notifications from an
   * account, so an empty inbox is not presented as a caught-up one.
   */
  mayBeWithheld?: boolean;
}

export function AllRead({ fullHeight = true, mayBeWithheld = false }: Readonly<AllReadProps>) {
  const hasFilters = useFiltersStore((s) => s.hasActiveFilters());

  const emoji = useMemo(() => randomElement(Constants.EMOJIS.ALL_READ), []);

  if (mayBeWithheld) {
    return (
      <EmojiSplash
        emoji={emoji}
        fullHeight={fullHeight}
        heading="Notifications may be missing"
        subHeadings={[
          'Organizations you have not authorized for this account may be withholding notifications.',
        ]}
      />
    );
  }

  const heading = `No new ${hasFilters ? 'filtered ' : ''} notifications`;

  return <EmojiSplash emoji={emoji} fullHeight={fullHeight} heading={heading} />;
}
