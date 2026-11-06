import type { ReactElement } from 'react';

import { useSettingsStore } from '../../stores';

import type { GitifyNotification } from '../../types';

import { ChecksPill } from './ChecksPill';
import { CommentsPill } from './CommentsPill';
import { IssueTypesPill } from './IssueTypesPill';
import { LabelsPill } from './LabelsPill';
import { LinkedIssuesPill } from './LinkedIssuesPill';
import { MetricPills } from './MetricPills';
import { MilestonePill } from './MilestonePill';
import { ParentPill } from './ParentPill';
import { ReactionsPill } from './ReactionsPill';
import { buildReviewPills } from './ReviewsPill';
import { StackedPrsPill } from './StackedPrsPill';
import { SubIssueProgressPill } from './SubIssueProgressPill';

export interface MetricGroupProps {
  notification: GitifyNotification;
}

export function MetricGroup({ notification }: Readonly<MetricGroupProps>) {
  const showPills = useSettingsStore((s) => s.showPills);

  if (!showPills) {
    return null;
  }

  const subject = notification.subject;

  // Keep the same classification → hierarchy → activity order the footer has
  // always used. Each entry is exactly one rendered pill so the overflow catch-
  // all can measure and count them independently.
  const pills: ReactElement[] = [];

  if (subject.issueType) {
    pills.push(<IssueTypesPill issueType={subject.issueType} key="issue-type" />);
  }

  if (subject.parentIssue) {
    pills.push(<ParentPill key="parent-issue" parent={subject.parentIssue} />);
  }

  if (subject.subIssueProgress?.total) {
    pills.push(
      <SubIssueProgressPill key="sub-issue-progress" progress={subject.subIssueProgress} />,
    );
  }

  if (subject.isStacked) {
    pills.push(
      <StackedPrsPill
        isStacked={subject.isStacked}
        key="stacked-prs"
        stackDepth={subject.stackDepth}
        stackPosition={subject.stackPosition}
      />,
    );
  }

  if (subject.linkedIssues?.length) {
    pills.push(<LinkedIssuesPill key="linked-issues" linkedIssues={subject.linkedIssues} />);
  }

  if (subject.milestone) {
    pills.push(<MilestonePill key="milestone" milestone={subject.milestone} />);
  }

  if (subject.checks?.total) {
    pills.push(<ChecksPill checks={subject.checks} key="checks" />);
  }

  pills.push(
    ...buildReviewPills({
      reviewers: subject.reviewers ?? [],
      reviewDecision: subject.reviewDecision,
    }),
  );

  if (subject.commentCount) {
    pills.push(<CommentsPill commentCount={subject.commentCount} key="comments" />);
  }

  if (subject.reactionsCount) {
    pills.push(
      <ReactionsPill
        key="reactions"
        reactionGroups={subject.reactionGroups ?? []}
        reactionsCount={subject.reactionsCount}
      />,
    );
  }

  if (subject.labels?.length || subject.issueFields?.length) {
    pills.push(
      <LabelsPill
        issueFields={subject.issueFields}
        key="labels"
        labelCount={subject.labelCount}
        labels={subject.labels ?? []}
      />,
    );
  }

  return <MetricPills pills={pills} />;
}
