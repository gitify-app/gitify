import type { ReactElement } from 'react';

import { CommentIcon, EyeIcon } from '@primer/octicons-react';

import { type GitifyPullRequestReviewer, type GitifyReviewDecision, IconColor } from '../../types';

import { getPullRequestReviewIcon, type PullRequestReviewGroup } from '../../utils/ui/icons';
import { MetricPill } from './MetricPill';

export interface ReviewsPillProps {
  reviewers: GitifyPullRequestReviewer[];
  reviewDecision?: GitifyReviewDecision;
}

/**
 * Review metrics can produce several pills (review required, one per review
 * state, and unresolved threads). Exposed separately from the component so the
 * metric strip can treat each pill as an independent overflow unit.
 */
export function buildReviewPills({
  reviewers,
  reviewDecision,
}: Readonly<ReviewsPillProps>): ReactElement[] {
  const isReviewRequired = reviewDecision === 'REVIEW_REQUIRED';

  if (!reviewers.length && !isReviewRequired) {
    return [];
  }

  const reviewGroups = getReviewGroups(reviewers);
  const reviewersWithThreads = reviewers.filter((reviewer) => reviewer.threads.total > 0);
  const threadTotal = reviewersWithThreads.reduce(
    (total, reviewer) => total + reviewer.threads.total,
    0,
  );
  const resolvedThreadTotal = reviewersWithThreads.reduce(
    (total, reviewer) => total + reviewer.threads.resolved,
    0,
  );
  const unresolvedThreadTotal = threadTotal - resolvedThreadTotal;

  const pills: ReactElement[] = [];

  if (isReviewRequired) {
    pills.push(
      <MetricPill
        ariaLabel="Review required"
        color={IconColor.YELLOW}
        contents="Review required"
        icon={EyeIcon}
        key="review-required"
      />,
    );
  }

  for (const review of reviewGroups) {
    if (review.state === 'COMMENTED') {
      continue;
    }

    const icon = getPullRequestReviewIcon(review);

    if (!icon) {
      continue;
    }

    pills.push(
      <MetricPill
        ariaLabel={icon.description}
        color={icon.color}
        contents={icon.description}
        icon={icon.type}
        key={`review-${review.state}`}
        metric={review.users.length}
      />,
    );
  }

  if (threadTotal) {
    pills.push(
      <MetricPill
        ariaLabel={`Review threads: ${resolvedThreadTotal} of ${threadTotal} resolved`}
        color={unresolvedThreadTotal ? IconColor.YELLOW : IconColor.GREEN}
        contents={formatReviewThreadDescription(reviewersWithThreads)}
        icon={CommentIcon}
        key="review-threads"
        metric={`${resolvedThreadTotal}/${threadTotal}`}
      />,
    );
  }

  return pills;
}

export function ReviewsPill({ reviewers, reviewDecision }: Readonly<ReviewsPillProps>) {
  return <>{buildReviewPills({ reviewers, reviewDecision })}</>;
}

function getReviewGroups(reviewers: GitifyPullRequestReviewer[]): PullRequestReviewGroup[] {
  const groups = new Map<NonNullable<GitifyPullRequestReviewer['state']>, string[]>();

  for (const reviewer of reviewers) {
    if (reviewer.state) {
      groups.set(reviewer.state, [...(groups.get(reviewer.state) ?? []), reviewer.user]);
    }
  }

  return Array.from(groups, ([state, users]) => ({ state, users })).sort((a, b) =>
    a.state.localeCompare(b.state),
  );
}

function formatReviewThreadDescription(reviewers: GitifyPullRequestReviewer[]): string {
  return reviewers
    .toSorted((a, b) => a.user.localeCompare(b.user))
    .map(({ user, threads }) => `${user}: ${threads.resolved}/${threads.total} resolved`)
    .join(' · ');
}
