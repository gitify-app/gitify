import { type GitifyTaskProgress, IconColor } from '../../types';

import { MetricPill } from './MetricPill';
import { SubIssueProgressWheel } from './SubIssueProgressPill';

export interface TaskProgressPillProps {
  progress?: GitifyTaskProgress;
}

export function TaskProgressPill({ progress }: Readonly<TaskProgressPillProps>) {
  if (!progress?.total) {
    return null;
  }

  const isCompleted = progress.completed === progress.total;
  const color = isCompleted ? IconColor.PURPLE : IconColor.GRAY;
  const description = `Tasks: ${progress.completed} of ${progress.total} completed`;

  return (
    <MetricPill
      ariaLabel={description}
      color={color}
      contents={description}
      iconElement={
        <SubIssueProgressWheel
          className={color}
          percent={Math.round((progress.completed / progress.total) * 100)}
        />
      }
      metric={`${progress.completed}/${progress.total}`}
    />
  );
}
