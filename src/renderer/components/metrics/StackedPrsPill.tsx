import type { FC } from 'react';

import { GitMergeIcon } from '@primer/octicons-react';

import { IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface StackedPrsPillProps {
  isStacked?: boolean;
  stackDepth?: number;
}

export const StackedPrsPill: FC<StackedPrsPillProps> = ({ isStacked, stackDepth }) => {
  if (!isStacked) {
    return null;
  }

  const contents = stackDepth
    ? `Part of a stacked PR series (${stackDepth} PRs)`
    : 'Part of a stacked PR series';

  return (
    <MetricPill
      color={IconColor.YELLOW}
      contents={contents}
      icon={GitMergeIcon}
      metric={stackDepth}
    />
  );
};
