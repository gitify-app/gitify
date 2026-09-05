import type { FC } from 'react';

import { type GitifySubIssueProgress, IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface SubIssueProgressPillProps {
  progress?: GitifySubIssueProgress | null;
}

export interface SubIssueProgressWheelProps {
  percent?: number;
  className?: string;
  size?: number;
}

export const SubIssueProgressWheel: FC<SubIssueProgressWheelProps> = ({
  percent = 0,
  className,
  size = 12,
}) => {
  const radius = 6;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference * (1 - clampedPercent / 100);

  return (
    <svg
      aria-hidden="true"
      className={className}
      data-testid="sub-issue-progress-wheel"
      fill="none"
      height={size}
      viewBox="0 0 16 16"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="8"
        cy="8"
        r={radius}
        stroke="currentColor"
        strokeWidth="2.2"
      />
      {clampedPercent > 0 && (
        <circle
          className="text-gitify-icon-done"
          cx="8"
          cy="8"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth="2.2"
          transform="rotate(-90 8 8)"
        />
      )}
    </svg>
  );
};

export const SubIssueProgressPill: FC<SubIssueProgressPillProps> = ({ progress }) => {
  if (!progress || progress.total === 0) {
    return null;
  }

  const isCompleted = progress.completed === progress.total;
  const description = `Sub-issues: ${progress.completed} of ${progress.total} completed (${progress.percentCompleted}%)`;

  const WheelIcon: FC<{ className?: string; size?: number }> = ({ className, size }) => (
    <SubIssueProgressWheel className={className} percent={progress.percentCompleted} size={size} />
  );

  return (
    <MetricPill
      color={isCompleted ? IconColor.PURPLE : IconColor.GRAY}
      contents={description}
      icon={WheelIcon}
      metric={`${progress.completed}/${progress.total}`}
    />
  );
};
