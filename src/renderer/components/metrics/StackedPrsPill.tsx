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
  if (!isStacked) {
    return null;
  }

  const metric =
    stackPosition != null && stackDepth != null ? `${stackPosition}/${stackDepth}` : undefined;

  return (
    <MetricPill
      color={IconColor.GRAY}
      contents="Part of a stacked pull request series"
      icon={StackIcon}
      metric={metric}
    />
  );
}
