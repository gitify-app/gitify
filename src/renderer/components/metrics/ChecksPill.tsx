import { useTranslation } from 'react-i18next';

import { CheckIcon, DotFillIcon, XIcon } from '@primer/octicons-react';

import { type GitifyCheckSummary, IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface ChecksPillProps {
  checks?: GitifyCheckSummary;
}

const checkStateDisplay = {
  SUCCESS: { icon: CheckIcon, color: IconColor.GREEN },
  FAILURE: { icon: XIcon, color: IconColor.RED },
  PENDING: { icon: DotFillIcon, color: IconColor.YELLOW },
} as const;

export function ChecksPill({ checks }: Readonly<ChecksPillProps>) {
  const { t } = useTranslation();
  if (!checks?.total) {
    return null;
  }

  const { icon, color } = checkStateDisplay[checks.state];
  const description = [
    t('metrics.checks_passed', '{{count}} passed', { count: checks.passed }),
    checks.failed ? t('metrics.checks_failed', '{{count}} failed', { count: checks.failed }) : null,
    checks.pending
      ? t('metrics.checks_pending', '{{count}} pending', { count: checks.pending })
      : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <MetricPill
      ariaLabel={t('metrics.checks', 'Checks: {{description}}', { description })}
      color={color}
      contents={t('metrics.checks', 'Checks: {{description}}', { description })}
      icon={icon}
      metric={`${checks.passed}/${checks.total}`}
    />
  );
}
