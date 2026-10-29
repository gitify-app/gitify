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
  if (!checks?.total) {
    return null;
  }

  const { icon, color } = checkStateDisplay[checks.state];
  const description = [
    `${checks.passed} passed`,
    checks.failed ? `${checks.failed} failed` : null,
    checks.pending ? `${checks.pending} pending` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <MetricPill
      ariaLabel={`Checks: ${description}`}
      color={color}
      contents={`Checks: ${description}`}
      icon={icon}
      metric={`${checks.passed}/${checks.total}`}
    />
  );
}
