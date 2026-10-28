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

  const description = metric
    ? `Stacked pull request: ${stackPosition} of ${stackDepth}`
    : 'Stacked pull request';

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
