import { useTranslation } from 'react-i18next';

import { MilestoneIcon } from '@primer/octicons-react';

import { type GitifyMilestone, IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface MilestonePillProps {
  milestone?: GitifyMilestone;
}

export function MilestonePill({ milestone }: Readonly<MilestonePillProps>) {
  const { t } = useTranslation();
  if (!milestone) {
    return null;
  }

  const isOpen = milestone.state === 'OPEN';
  const description = isOpen
    ? t('metrics.milestone_open', 'Milestone: {{title}} (open)', { title: milestone.title })
    : t('metrics.milestone_closed', 'Milestone: {{title}} (closed)', { title: milestone.title });

  return (
    <MetricPill
      ariaLabel={description}
      color={isOpen ? IconColor.GREEN : IconColor.PURPLE}
      contents={description}
      icon={MilestoneIcon}
    />
  );
}
