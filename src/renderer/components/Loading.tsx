import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Constants } from '../constants';

import { EmojiSplash } from './layout/EmojiSplash';

import { randomElement } from '../utils/core/random';

export function Loading() {
  const { t } = useTranslation();
  const emoji = useMemo(() => randomElement(Constants.EMOJIS.LOADING), []);

  return <EmojiSplash emoji={emoji} fullHeight heading={t('common.loading', 'Loading')} />;
}
