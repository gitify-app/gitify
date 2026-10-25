import { useMemo } from 'react';

import { Constants } from '../constants';

import { EmojiSplash } from './layout/EmojiSplash';

import { randomElement } from '../utils/core/random';

export function Loading() {
  const emoji = useMemo(() => randomElement(Constants.EMOJIS.LOADING), []);

  return <EmojiSplash emoji={emoji} fullHeight heading="Loading" />;
}
