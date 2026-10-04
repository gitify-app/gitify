import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { GitMergeIcon } from '@primer/octicons-react';

import { IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface StackedPrsPillProps {
  isStacked?: boolean;
  stackPosition?: number;
  stackDepth?: number;
}

export const StackedPrsPill: FC<StackedPrsPillProps> = ({
  isStacked,
  stackPosition,
  stackDepth,
}) => {
  const { t } = useTranslation();

  if (!isStacked) {
    return null;
  }

  const metric =
    stackPosition != null && stackDepth != null ? `${stackPosition}/${stackDepth}` : undefined;

  return (
    <MetricPill
      color={IconColor.YELLOW}
      contents={t('metrics.stacked_prs', 'Part of a stacked PR series')}
      icon={GitMergeIcon}
      metric={metric}
    />
  );
};
