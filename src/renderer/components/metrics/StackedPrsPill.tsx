import type { FC } from 'react';

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
  if (!isStacked) {
    return null;
  }

  const metric = stackPosition && stackDepth ? `${stackPosition}/${stackDepth}` : undefined;

  return (
    <MetricPill
      color={IconColor.YELLOW}
      contents="Part of a stacked PR series"
      icon={GitMergeIcon}
      metric={metric}
    />
  );
};
