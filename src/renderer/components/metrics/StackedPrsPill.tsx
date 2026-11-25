import { useTranslation } from 'react-i18next';

import { StackIcon } from '@primer/octicons-react';

import { IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface StackedPrsPillProps {
  isStacked?: boolean;
  stackPosition?: number;
  stackDepth?: number;
}

export function StackedPrsPill({
  isStacked,
  stackPosition,
  stackDepth,
}: Readonly<StackedPrsPillProps>) {
  const { t } = useTranslation();
  if (!isStacked) {
    return null;
  }

  const metric =
    stackPosition != null && stackDepth != null ? `${stackPosition}/${stackDepth}` : undefined;

  const description = metric
    ? t('metrics.stacked_pr_position', 'Stacked pull request: {{position}} of {{depth}}', {
        position: stackPosition,
        depth: stackDepth,
      })
    : t('metrics.stacked_pr', 'Stacked pull request');

  return (
    <MetricPill
      ariaLabel={description}
      color={IconColor.GRAY}
      contents={description}
      icon={StackIcon}
      metric={metric}
    />
  );
}
