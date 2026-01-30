import type { FC } from 'react';

import { MilestoneIcon } from '@primer/octicons-react';

import { IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface Milestone {
  title: string;
  state: string;
}

export interface MilestonePillProps {
  milestone: Milestone;
}

export const MilestonePill: FC<MilestonePillProps> = ({ milestone }) => {
  if (!milestone) {
    return null;
  }

  return (
    <MetricPill
      color={milestone.state === 'OPEN' ? IconColor.GREEN : IconColor.PURPLE}
      icon={MilestoneIcon}
      title={milestone.title}
    />
  );
};
