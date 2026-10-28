import { useSettingsStore } from '../../stores';

import type { GitifyNotification } from '../../types';

import { ChecksPill } from './ChecksPill';
import { CommentsPill } from './CommentsPill';
import { IssueTypesPill } from './IssueTypesPill';
import { LabelsPill } from './LabelsPill';
import { LinkedIssuesPill } from './LinkedIssuesPill';
import { MilestonePill } from './MilestonePill';
import { ParentPill } from './ParentPill';
import { ReactionsPill } from './ReactionsPill';
import { ReviewsPill } from './ReviewsPill';
import { StackedPrsPill } from './StackedPrsPill';
import { SubIssueProgressPill } from './SubIssueProgressPill';
import { TaskProgressPill } from './TaskProgressPill';

export interface MetricGroupProps {
  notification: GitifyNotification;
}

export function MetricGroup({ notification }: Readonly<MetricGroupProps>) {
  const showPills = useSettingsStore((s) => s.showPills);

  if (!showPills) {
    return null;
  }

  return (
    // `flex-wrap` + `min-w-0` let the pills wrap within the row instead of
    // overflowing the row and being clipped.
    <div className="flex min-w-0 flex-wrap gap-1">
      <IssueTypesPill issueType={notification.subject.issueType} />

      <ParentPill parent={notification.subject.parentIssue} />

      <SubIssueProgressPill progress={notification.subject.subIssueProgress} />

      <StackedPrsPill
        isStacked={notification.subject.isStacked}
        stackPosition={notification.subject.stackPosition}
        stackDepth={notification.subject.stackDepth}
      />

      <LinkedIssuesPill linkedIssues={notification.subject.linkedIssues ?? []} />

      <MilestonePill milestone={notification.subject.milestone} />

      <ChecksPill checks={notification.subject.checks} />

      <ReviewsPill
        reviewDecision={notification.subject.reviewDecision}
        reviewers={notification.subject.reviewers ?? []}
      />

      <CommentsPill commentCount={notification.subject.commentCount ?? 0} />

      <ReactionsPill
        reactionGroups={notification.subject.reactionGroups ?? []}
        reactionsCount={notification.subject.reactionsCount ?? 0}
      />

      <TaskProgressPill progress={notification.subject.taskProgress} />

      <LabelsPill
        labels={notification.subject.labels ?? []}
        issueFields={notification.subject.issueFields ?? []}
      />
    </div>
  );
}
