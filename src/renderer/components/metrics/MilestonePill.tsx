import { MilestoneIcon } from '@primer/octicons-react';

import { type GitifyMilestone, IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface MilestonePillProps {
  milestone?: GitifyMilestone;
}

export function MilestonePill({ milestone }: Readonly<MilestonePillProps>) {
  if (!milestone) {
    return null;
  }

  return (
    <MetricPill
      color={milestone.state === 'OPEN' ? IconColor.GREEN : IconColor.PURPLE}
      contents={milestone.title}
      icon={MilestoneIcon}
    />
  );
}
