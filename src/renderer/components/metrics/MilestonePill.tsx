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

  const isOpen = milestone.state === 'OPEN';
  const description = `Milestone: ${milestone.title} (${isOpen ? 'open' : 'closed'})`;

  return (
    <MetricPill
      ariaLabel={description}
      color={isOpen ? IconColor.GREEN : IconColor.PURPLE}
      contents={description}
      icon={MilestoneIcon}
    />
  );
}
